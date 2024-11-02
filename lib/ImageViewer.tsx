import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDecay,
	withTiming,
} from "react-native-reanimated";

export type ImageViewerProps = {
	imageUrl: string;
	width: number;
	height: number;
	onRequestClose: () => unknown;
	onSingleTap?: () => unknown;
};

const MAX_ZOOM_SCALE = 3;

export default function ImageViewer({
	imageUrl,
	width,
	height,
	onSingleTap,
	onRequestClose,
}: ImageViewerProps) {
	const dimensions = useWindowDimensions();

	const scale = useSharedValue(1);
	const savedScale = useSharedValue(1);

	const translateY = useSharedValue(0);
	const savedTranslateY = useSharedValue(0);

	const translateX = useSharedValue(0);
	const savedTranslateX = useSharedValue(0);

	const { width: finalWidth, height: finalHeight } = useMemo(() => {
		function ruleOfThree(
			firstValue: number,
			firstResult: number,
			secondValue: number,
		) {
			const secondResult = (firstResult * secondValue) / firstValue;

			return secondResult;
		}

		const resizedBasedOnWidth = {
			width: dimensions.width,
			height: ruleOfThree(width, dimensions.width, height),
		};

		const resizedBasedOnHeight = {
			width: ruleOfThree(height, dimensions.height, width),
			height: dimensions.height,
		};

		if (width === height) {
			const smallestScreenDimension = Math.min(
				dimensions.width,
				dimensions.height,
			);

			return {
				width: smallestScreenDimension,
				height: smallestScreenDimension,
			};
		}

		if (width > height) {
			return resizedBasedOnWidth;
		}

		if (resizedBasedOnHeight.width > dimensions.width) {
			return resizedBasedOnWidth;
		}

		return resizedBasedOnHeight;
	}, [width, height, dimensions.width, dimensions.height]);

	const pinchGesture = Gesture.Pinch()
		.onStart(() => {
			savedScale.value = scale.value;
		})
		.onUpdate((event) => {
			scale.value = savedScale.value * event.scale;
		});

	const panGesture = Gesture.Pan()
		.onStart(() => {
			savedTranslateX.value = translateX.value;
			savedTranslateY.value = translateY.value;
		})
		.onUpdate((event) => {
			if (scale.value < 1) {
				return;
			}

			const realImageWidth = finalWidth * scale.value;

			const maxTranslateX =
				realImageWidth <= dimensions.width
					? 0
					: (realImageWidth - dimensions.width) / 2;
			const minTranslateX =
				realImageWidth <= dimensions.width
					? 0
					: -(realImageWidth - dimensions.width) / 2;

			const possibleNewTranslateX = savedTranslateX.value + event.translationX;

			if (possibleNewTranslateX > maxTranslateX) {
				translateX.value = maxTranslateX;
			} else if (possibleNewTranslateX < minTranslateX) {
				translateX.value = minTranslateX;
			} else {
				translateX.value = possibleNewTranslateX;
			}

			if (scale.value > 1) {
				const realImageHeight = finalHeight * scale.value;

				const maxTranslateY =
					realImageHeight <= dimensions.height
						? 0
						: (realImageHeight - dimensions.height) / 2;
				const minTranslateY =
					realImageHeight <= dimensions.height
						? 0
						: -(realImageHeight - dimensions.height) / 2;

				const possibleNewTranslateY =
					savedTranslateY.value + event.translationY;

				if (possibleNewTranslateY > maxTranslateY) {
					translateY.value = maxTranslateY;
				} else if (possibleNewTranslateY < minTranslateY) {
					translateY.value = minTranslateY;
				} else {
					translateY.value = possibleNewTranslateY;
				}
			} else {
				translateY.value = savedTranslateY.value + event.translationY;
			}
		})
		.onEnd((event) => {
			if (scale.value === 1) {
				if (event.translationY < -50) {
					if (event.velocityY < -2000 || event.translationY < -200) {
						runOnJS(onRequestClose)();

						return;
					}
				}

				translateY.value = withTiming(0);
				translateX.value = withTiming(0);
			} else if (scale.value < 1) {
				scale.value = withTiming(1);
				translateX.value = withTiming(0);
				translateY.value = withTiming(0);
			} else if (scale.value > MAX_ZOOM_SCALE) {
				scale.value = withTiming(MAX_ZOOM_SCALE);
			} else {
				const realImageWidth = finalWidth * scale.value;

				const maxTranslateX =
					realImageWidth <= dimensions.width
						? 0
						: (realImageWidth - dimensions.width) / 2;
				const minTranslateX =
					realImageWidth <= dimensions.width
						? 0
						: -(realImageWidth - dimensions.width) / 2;

				translateX.value = withDecay({
					velocity: event.velocityX,
					clamp: [minTranslateX, maxTranslateX],
				});

				const realImageHeight = finalHeight * scale.value;

				const maxTranslateY =
					realImageHeight <= dimensions.height
						? 0
						: (realImageHeight - dimensions.height) / 2;
				const minTranslateY =
					realImageHeight <= dimensions.height
						? 0
						: -(realImageHeight - dimensions.height) / 2;

				translateY.value = withDecay({
					velocity: event.velocityY,
					clamp: [minTranslateY, maxTranslateY],
				});
			}
		});

	const singleTap = Gesture.Tap().onEnd(() => {
		onSingleTap && runOnJS(onSingleTap)();
	});

	const doubleTap = Gesture.Tap()
		.onStart((event) => {
			if (scale.value > 1) {
				scale.value = withTiming(1);
				translateX.value = withTiming(0);
				translateY.value = withTiming(0);
			} else {
				scale.value = withTiming(MAX_ZOOM_SCALE);

				const realImageWidth = finalWidth * MAX_ZOOM_SCALE;

				const maxTranslateX = (realImageWidth - dimensions.width) / 2;
				const minTranslateX = -(realImageWidth - dimensions.width) / 2;

				const possibleNewTranslateX =
					(finalWidth / 2 - event.x) * MAX_ZOOM_SCALE;

				let newTranslateX = 0;

				if (possibleNewTranslateX > maxTranslateX) {
					newTranslateX = maxTranslateX;
				} else if (possibleNewTranslateX < minTranslateX) {
					newTranslateX = minTranslateX;
				} else {
					newTranslateX = possibleNewTranslateX;
				}

				translateX.value = withTiming(newTranslateX);

				const realImageHeight = finalHeight * MAX_ZOOM_SCALE;

				const maxTranslateY =
					realImageHeight <= dimensions.height
						? 0
						: (realImageHeight - dimensions.height) / 2;
				const minTranslateY =
					realImageHeight <= dimensions.height
						? 0
						: -(realImageHeight - dimensions.height) / 2;

				const possibleNewTranslateY =
					(finalHeight / 2 - event.y) * MAX_ZOOM_SCALE;

				let newTranslateY = 0;

				if (possibleNewTranslateY > maxTranslateY) {
					newTranslateY = maxTranslateY;
				} else if (possibleNewTranslateY < minTranslateY) {
					newTranslateY = minTranslateY;
				} else {
					newTranslateY = possibleNewTranslateY;
				}

				translateY.value = withTiming(newTranslateY);
			}
		})
		.numberOfTaps(2);

	const imageContainerAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateX: translateX.value },
				{ translateY: translateY.value },
			],
		};
	});

	const imageAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					scale: scale.value,
				},
			],
		};
	}, []);

	const composedGestures = Gesture.Simultaneous(pinchGesture, panGesture);
	const allGestures = Gesture.Exclusive(composedGestures, doubleTap, singleTap);

	return (
		<GestureDetector gesture={allGestures}>
			<Animated.View
				style={{
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#000",
				}}
			>
				<Animated.View style={imageContainerAnimatedStyle}>
					<Animated.Image
						style={[
							imageAnimatedStyle,
							{
								width: finalWidth,
								height: finalHeight,
							},
						]}
						source={{
							uri: imageUrl,
						}}
					/>
				</Animated.View>
			</Animated.View>
		</GestureDetector>
	);
}

//child component
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface RoleProps {
  count: number; //receives the number from parent component
  setCount: React.Dispatch<React.SetStateAction<number>>; //receives the function from parent component
  Reset: () => void; //receives the reset function from parent component
}

interface HeartParticle {
  id: number;
  x: number;
  scale: number;
}

// cutesy Flying Hearts Effect
const AnimatedHeart = ({ x, scale }: { x: number; scale: number }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(x);

  useEffect(() => {
    // Float upwards
    translateY.value = withTiming(-180, { duration: 1100, easing: Easing.out(Easing.quad) });
    // Fade out
    opacity.value = withTiming(0, { duration: 1100, easing: Easing.out(Easing.quad) });
    // Sway left/right
    translateX.value = withTiming(x + (Math.random() > 0.5 ? 24 : -24), {
      duration: 1100,
      easing: Easing.inOut(Easing.sin),
    });
  }, [x]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale },
      ],
      opacity: opacity.value,
      position: 'absolute',
      bottom: 110, // Start just above the jar liquid base
      alignSelf: 'center',
      zIndex: 10,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="heart" size={24} color="#FF4D79" />
    </Animated.View>
  );
};

//use the values received from
const CounterDisplay: React.FC<RoleProps> = ({ count, setCount, Reset }) => {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countScale = useSharedValue(1);
  const liquidHeight = useSharedValue(Math.max(0, Math.min(100, count)));
  const [hearts, setHearts] = useState<HeartParticle[]>([]);

  // Animate the count text when it changes
  useEffect(() => {
    countScale.value = withSequence(
      withSpring(1.25, { damping: 4, stiffness: 350 }),
      withSpring(1.0, { damping: 10, stiffness: 200 })
    );
  }, [count, countScale]);

  // pink liquid animated
  useEffect(() => {
    liquidHeight.value = withSpring(Math.max(0, Math.min(100, count)), {
      damping: 14,
      stiffness: 80,
    });
  }, [count, liquidHeight]);

  const triggerHaptic = (style: 'light' | 'medium') => {
    if (style === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const spawnHeart = () => { //lalabas mga heart
    const id = Date.now() + Math.random();
    const randomX = Math.random() * 70 - 35;
    const scale = Math.random() * 0.4 + 0.8;
    setHearts((prev) => [...prev, { id, x: randomX, scale }]);

    // Clean up heart after animation ends
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1200);
  };

  const startCounter = (actionType: 'plus' | 'minus') => {
    stopCounter();

    // Single tap action
    if (actionType === 'plus') {
      setCount((prev) => prev + 1);
      spawnHeart();
    } else {
      setCount((prev) => prev - 1);
    }
    triggerHaptic('light');

    // Hold action trigger
    timerRef.current = setInterval(() => {
      if (actionType === 'plus') {
        setCount((prev) => prev + 1);
        spawnHeart();
      } else {
        setCount((prev) => prev - 1);
      }
      triggerHaptic('light');
    }, 120);
  };

  const stopCounter = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleReset = () => {
    Reset();
    triggerHaptic('medium');
  };

  const animatedCountStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: countScale.value }],
    };
  });

  const animatedLiquidStyle = useAnimatedStyle(() => {
    return {
      height: `${liquidHeight.value}%`,
    };
  });

  return (
    <View style={styles.childCard}>
      {/* 
        Child Component Badge
        <View style={styles.childBadge}>
          <Text style={styles.badgeText}>CHILD COMPONENT (customButton.tsx)</Text>
        </View>

        Ako ang Child Component Text
        <Text style={styles.childTitle}>Ako ang Child Component</Text>

        Visual Indicator of Incoming Props
        <View style={styles.propsDataIndicator}>
          <Ionicons name="arrow-down-circle" size={16} color="#7C4DFF" style={styles.arrowIcon} />
          <Text style={styles.propsDataText}>PROPS DATA (Galing sa Parent State)</Text>
        </View>
      */}

      {/* Glass Jar containing Pink Liquid & Spawning Heart Particles */}
      <View style={styles.jarWrapper}>
        {/* flying hearts */}
        {hearts.map((heart) => (
          <AnimatedHeart
            key={heart.id}
            x={heart.x}
            scale={heart.scale}
          />
        ))}

        {/* Jar cork lid */}
        <View style={styles.jarCork} />

        {/* Jar body */}
        <View style={styles.jarBody}>
          {/* Spring-animated pink liquid */}
          <Animated.View style={[styles.jarLiquid, animatedLiquidStyle]} />

          {/* Sparkly reflection stripe on glass */}
          <View style={styles.jarShine} />

          {/* Count Value text in center */}
          <Animated.View style={[styles.countOverlay, animatedCountStyle]}>
            <Text style={styles.countText}>{count}</Text>
          </Animated.View>
        </View>
      </View>

      {/* 
        Props Function Indicator
        <View style={styles.propsFunctionIndicator}>
          <Ionicons name="arrow-up-circle" size={16} color="#00B0FF" style={styles.arrowIcon} />
          <Text style={styles.propsFunctionText}>PROPS FUNCTION (Triggers Parent State)</Text>
        </View>
      */}

      {/* Button Controls Container */}
      <View style={styles.buttonsContainer}>
        {/* Add Count Button */}
        <Pressable
          onPressIn={() => startCounter('plus')}
          onPressOut={stopCounter}
          style={({ pressed }) => [
            styles.btn,
            styles.btnAdd,
            pressed && styles.btnActive,
          ]}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.btnText}>Pet The Cat </Text>
        </Pressable>

        {/* Minus Count Button */}
        <Pressable
          onPressIn={() => startCounter('minus')}
          onPressOut={stopCounter}
          style={({ pressed }) => [
            styles.btn,
            styles.btnMinus,
            pressed && styles.btnActive,
          ]}>
          <Ionicons name="remove" size={20} color="#FFFFFF" />
          <Text style={styles.btnText}>Minus Count</Text>
        </Pressable>

        {/* Reset Button */}
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            styles.btn,
            styles.btnReset,
            pressed && styles.btnActive,
          ]}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.btnText}>Reset Count</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default CounterDisplay;

const styles = StyleSheet.create({
  childCard: {
    backgroundColor: '#FAF8FF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E6E0FA',
    padding: 20,
    marginTop: 5,
    alignItems: 'center',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
  },
  jarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    position: 'relative',
    height: 220,
    width: '100%',
  },
  jarCork: {
    width: 66,
    height: 14,
    backgroundColor: '#C5A080', // Soft cork brown
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    zIndex: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  jarBody: {
    width: 146,
    height: 180,
    borderWidth: 4,
    borderColor: '#5D5086', // Cute dark lavender glass outline
    borderTopWidth: 2,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // Glass transparency
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#5D5086',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    zIndex: 2,
  },
  jarLiquid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF6F96', // Cute bright pink candy liquid
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  jarShine: {
    position: 'absolute',
    top: '8%',
    left: 10,
    width: 8,
    height: '84%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // White glass specular shine
    borderRadius: 4,
    zIndex: 3,
  },
  countOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  countText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#31275A', // High contrast deep purple
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  buttonsContainer: {
    width: '100%',
    gap: 10,
    marginTop: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    gap: 6,
  },
  btnAdd: {
    backgroundColor: '#FF5C8A', // Cute vibrant pink
    shadowColor: '#FF5C8A',
  },
  btnMinus: {
    backgroundColor: '#FF6B6B', // Cute coral red
    shadowColor: '#FF6B6B',
  },
  btnReset: {
    backgroundColor: '#95A5A6', // Modern grey/slate
    shadowColor: '#95A5A6',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnActive: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});

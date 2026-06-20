//child component - Cat Jar with Sound Effects (Unlimited Count + Minus Sound)
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
import { Audio } from 'expo-av';

interface RoleProps {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  Reset: () => void;
}

interface HeartParticle {
  id: number;
  x: number;
  scale: number;
}

// Flying Hearts Effect
const AnimatedHeart = ({ x, scale }: { x: number; scale: number }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(x);

  useEffect(() => {
    translateY.value = withTiming(-180, { duration: 1100, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(0, { duration: 1100, easing: Easing.out(Easing.quad) });
    translateX.value = withTiming(x + (Math.random() > 0.5 ? 24 : -24), {
      duration: 1100,
      easing: Easing.inOut(Easing.sin),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.heartContainer, animatedStyle]}>
      <Ionicons name="heart" size={24} color="#FF4D79" />
    </Animated.View>
  );
};

const CounterDisplay: React.FC<RoleProps> = ({ count, setCount, Reset }) => {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countScale = useSharedValue(1);
  const liquidHeight = useSharedValue(Math.max(0, Math.min(100, count)));
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const meowSoundRef = useRef<Audio.Sound | null>(null);      // ✅ For plus/meow sound
  const minusSoundRef = useRef<Audio.Sound | null>(null);     // ✅ For minus sound

  // Load and play MEOW sound (for PLUS)
  const playMeowSound = async () => {
    try {
      if (meowSoundRef.current) {
        await meowSoundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound-effects/cartoon-kitten-epic-stock-media-2-2-00-00.mp3')
      );
      meowSoundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log('Failed to play meow sound', error);
    }
  };

  // ✅ Load and play MINUS sound (for MINUS button)
  const playMinusSound = async () => {
    try {
      if (minusSoundRef.current) {
        await minusSoundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound-effects/android-icon-foreground.mp3')
      );
      minusSoundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log('Failed to play minus sound', error);
    }
  };

  // Cleanup sounds on unmount
  useEffect(() => {
    return () => {
      if (meowSoundRef.current) {
        meowSoundRef.current.unloadAsync();
      }
      if (minusSoundRef.current) {
        minusSoundRef.current.unloadAsync();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Animate count text
  useEffect(() => {
    countScale.value = withSequence(
      withSpring(1.25, { damping: 4, stiffness: 350 }),
      withSpring(1.0, { damping: 10, stiffness: 200 })
    );
  }, [count]);

  // Animate liquid height (capped at 100% for visual, but count can go higher)
  useEffect(() => {
    liquidHeight.value = withSpring(Math.min(100, count), {
      damping: 14,
      stiffness: 80,
    });
  }, [count]);

  const triggerHaptic = (style: 'light' | 'medium') => {
    if (style === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const spawnHeart = () => {
    const id = Date.now() + Math.random();
    const randomX = Math.random() * 70 - 35;
    const scale = Math.random() * 0.4 + 0.8;
    setHearts((prev) => [...prev, { id, x: randomX, scale }]);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1200);
  };

  const startCounter = (actionType: 'plus' | 'minus') => {
    stopCounter();

    if (actionType === 'plus') {
      setCount((prev) => prev + 1);
      spawnHeart();
      playMeowSound();          // ✅ Meow sound for plus
      triggerHaptic('light');
    } else {
      setCount((prev) => prev - 1);
      playMinusSound();         // ✅ Minus sound for minus
      triggerHaptic('light');
    }

    // Hold action
    timerRef.current = setInterval(() => {
      if (actionType === 'plus') {
        setCount((prev) => prev + 1);
        spawnHeart();
        if (Math.random() > 0.7) {
          playMeowSound();
        }
        triggerHaptic('light');
      } else {
        setCount((prev) => prev - 1);
        if (Math.random() > 0.7) {
          playMinusSound();     // ✅ Occasional minus sound during hold
        }
        triggerHaptic('light');
      }
    }, 150);
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

  const animatedCountStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  const animatedLiquidStyle = useAnimatedStyle(() => ({
    height: `${liquidHeight.value}%`,
  }));

  return (
    <View style={styles.childCard}>
      {/* Cat Container */}
      <View style={styles.catWrapper}>
        {/* Flying Hearts */}
        {hearts.map((heart) => (
          <AnimatedHeart key={heart.id} x={heart.x} scale={heart.scale} />
        ))}

        {/* Cat Ears */}
        <View style={styles.leftEar}>
          <View style={styles.innerEar} />
        </View>
        <View style={styles.rightEar}>
          <View style={styles.innerEar} />
        </View>

        {/* Cat Body (Jar) */}
        <View style={styles.catBody}>
          <Animated.View style={[styles.catLiquid, animatedLiquidStyle]} />
          <View style={styles.catShine} />

          {/* Cat Face */}
          <View style={styles.faceContainer}>
            <View style={styles.eyeLeft} />
            <View style={styles.eyeRight} />
            <Text style={styles.catSnout}>w</Text>
            <View style={styles.cheekLeft} />
            <View style={styles.cheekRight} />
          </View>

          {/* Whiskers */}
          <View style={styles.whiskerLeft1} />
          <View style={styles.whiskerLeft2} />
          <View style={styles.whiskerRight1} />
          <View style={styles.whiskerRight2} />

          {/* Count Number */}
          <Animated.View style={[styles.countOverlay, animatedCountStyle]}>
            <Text style={styles.countText}>{count}</Text>
          </Animated.View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable
          onPressIn={() => startCounter('plus')}
          onPressOut={stopCounter}
          style={({ pressed }) => [
            styles.btn,
            styles.btnAdd,
            pressed && styles.btnActive,
          ]}>
          <Ionicons name="heart" size={20} color="#FFFFFF" />
          <Text style={styles.btnText}>🐾 Pet The Cat</Text>
        </Pressable>

        <Pressable
          onPressIn={() => startCounter('minus')}
          onPressOut={stopCounter}
          style={({ pressed }) => [
            styles.btn,
            styles.btnMinus,
            pressed && styles.btnActive,
          ]}>
          <Ionicons name="remove" size={20} color="#FFFFFF" />
          <Text style={styles.btnText}>Tickle the Cat 😡</Text>
        </Pressable>

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
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
  },
  catWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    position: 'relative',
    height: 220,
    width: '100%',
  },
  leftEar: {
    position: 'absolute',
    top: 14,
    left: '26%',
    width: 38,
    height: 38,
    backgroundColor: '#5D5086',
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    transform: [{ rotate: '-18deg' }],
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightEar: {
    position: 'absolute',
    top: 14,
    right: '26%',
    width: 38,
    height: 38,
    backgroundColor: '#5D5086',
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    transform: [{ rotate: '18deg' }],
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerEar: {
    width: '60%',
    height: '60%',
    backgroundColor: '#FFB6C1',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  catBody: {
    width: 150,
    height: 180,
    borderWidth: 4,
    borderColor: '#5D5086',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    overflow: 'hidden',
    position: 'relative',
  },
  catLiquid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF6F96',
    borderBottomLeftRadius: 55,
    borderBottomRightRadius: 55,
  },
  catShine: {
    position: 'absolute',
    top: '8%',
    left: 10,
    width: 8,
    height: '84%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 4,
    zIndex: 3,
  },
  faceContainer: {
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  eyeLeft: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#31275A',
    position: 'absolute',
    left: 36,
    top: 10,
  },
  eyeRight: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#31275A',
    position: 'absolute',
    right: 36,
    top: 10,
  },
  catSnout: {
    color: '#31275A',
    fontSize: 13,
    fontWeight: '900',
    position: 'absolute',
    top: 13,
    alignSelf: 'center',
  },
  cheekLeft: {
    width: 10,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFB6C1',
    position: 'absolute',
    left: 24,
    top: 18,
    opacity: 0.8,
  },
  cheekRight: {
    width: 10,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFB6C1',
    position: 'absolute',
    right: 24,
    top: 18,
    opacity: 0.8,
  },
  whiskerLeft1: {
    position: 'absolute',
    left: 4,
    top: 42,
    width: 14,
    height: 2,
    backgroundColor: 'rgba(93, 80, 134, 0.4)',
    borderRadius: 1,
    transform: [{ rotate: '12deg' }],
    zIndex: 4,
  },
  whiskerLeft2: {
    position: 'absolute',
    left: 4,
    top: 50,
    width: 14,
    height: 2,
    backgroundColor: 'rgba(93, 80, 134, 0.4)',
    borderRadius: 1,
    transform: [{ rotate: '-8deg' }],
    zIndex: 4,
  },
  whiskerRight1: {
    position: 'absolute',
    right: 4,
    top: 42,
    width: 14,
    height: 2,
    backgroundColor: 'rgba(93, 80, 134, 0.4)',
    borderRadius: 1,
    transform: [{ rotate: '-12deg' }],
    zIndex: 4,
  },
  whiskerRight2: {
    position: 'absolute',
    right: 4,
    top: 50,
    width: 14,
    height: 2,
    backgroundColor: 'rgba(93, 80, 134, 0.4)',
    borderRadius: 1,
    transform: [{ rotate: '8deg' }],
    zIndex: 4,
  },
  countOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  countText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#31275A',
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginTop: 20,
  },
  heartContainer: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    zIndex: 10,
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
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    gap: 6,
  },
  btnAdd: {
    backgroundColor: '#FF5C8A',
    shadowColor: '#FF5C8A',
  },
  btnMinus: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
  },
  btnReset: {
    backgroundColor: '#95A5A6',
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
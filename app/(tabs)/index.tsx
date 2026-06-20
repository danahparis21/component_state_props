import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import CounterDisplay from '../../components/customButton';

export default function Index() {
  const insets = useSafeAreaInsets();
  const originalValue = 100;
  const [count, setCount] = useState(originalValue);

  // Animated values for the visual pipelines
  const flowDown = useSharedValue(0);
  const flowUp = useSharedValue(0);

  useEffect(() => {
    // Flowing downwards (0 to 24px translation)
    flowDown.value = withRepeat(
      withTiming(24, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
    // Flowing upwards (24 to 0px translation)
    flowUp.value = withRepeat(
      withTiming(-24, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, [flowDown, flowUp]);

  const animatedFlowDownStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: flowDown.value }],
    };
  });

  const animatedFlowUpStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: flowUp.value }],
    };
  });

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      
      {/* Outer Parent Card with Rounded Cute Orange/Coral Border */}
      <View style={styles.parentCard}>
        
        {/* Parent Component Badge */}
        <View style={styles.parentBadge}>
          <Text style={styles.badgeText}>PARENT COMPONENT (index.tsx)</Text>
        </View>

        <Text style={styles.titleText}>Ako ang Parent Screen</Text>

        {/* State Locker Box (Cute cloud/jar design) */}
        <View style={styles.stateBox}>
          <View style={styles.stateHeader}>
            <Ionicons name="lock-closed" size={16} color="#2ECC71" style={styles.stateIcon} />
            <Text style={styles.stateTitle}>STATE LOCKER</Text>
          </View>
          <Text style={styles.stateValue}>count: {count}</Text>
        </View>

        {/* Visual Pipeline (Props Data Flow Down) */}
        <View style={styles.pipelineContainer}>
          <View style={styles.pipelineLine}>
            {/* Animated flowing dots/arrows inside the pipeline */}
            <Animated.View style={[styles.flowingIndicator, animatedFlowDownStyle]}>
              <Ionicons name="chevron-down" size={14} color="#7C4DFF" />
            </Animated.View>
          </View>
        </View>

        {/* Dito nakasaksak ang pagpasa ng Props papunta sa Child */}
        <CounterDisplay
          count={count}
          setCount={setCount}
          Reset={() => setCount(originalValue)}
        />

        {/* Visual Pipeline (Props Function Feedback Up) */}
        <View style={styles.pipelineContainerUp}>
          <View style={styles.pipelineLineUp}>
            {/* Animated flowing dots/arrows inside the pipeline */}
            <Animated.View style={[styles.flowingIndicatorUp, animatedFlowUpStyle]}>
              <Ionicons name="chevron-up" size={14} color="#00B0FF" />
            </Animated.View>
          </View>
        </View>
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6F0', // Cute cream/peach soft backdrop
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  parentCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#FFB84D', // Warm pastel orange/coral
    padding: 24,
    shadowColor: '#FFB84D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
    marginVertical: 10,
  },
  parentBadge: {
    backgroundColor: '#FF9F43', // Solid orange badge
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignSelf: 'center',
    position: 'absolute',
    top: -14,
    shadowColor: '#FF9F43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2A2050',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  stateBox: {
    backgroundColor: '#EBFBEE', // Sweet soft mint green
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C2F0C8',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stateIcon: {
    marginRight: 6,
  },
  stateTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#27AE60',
    letterSpacing: 1.5,
  },
  stateValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E7E34',
    fontVariant: ['tabular-nums'],
  },
  pipelineContainer: {
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  pipelineLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#E6E0FA',
    position: 'relative',
    overflow: 'hidden',
  },
  flowingIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: -10,
  },
  pipelineContainerUp: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  pipelineLineUp: {
    width: 2,
    height: '100%',
    backgroundColor: '#E0F7FF',
    position: 'relative',
    overflow: 'hidden',
  },
  flowingIndicatorUp: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: -10,
  },
});

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function FloatingMusicBackground({ noteColor = "#6D7E79" }) {
  const floatAnims = useRef(
    Array.from({ length: 12 }).map(() => ({
      x: new Animated.Value(Math.random() * 360 - 180),
      y: new Animated.Value(Math.random() * 700 - 350),
      opacity: new Animated.Value(Math.random() * 0.2 + 0.1)
    }))
  ).current;

  useEffect(() => {
    const loops = floatAnims.map((anim, idx) =>
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(anim.y, {
              toValue: anim.y.__getValue() - (40 + (idx % 3) * 15),
              duration: 3600 + idx * 120,
              useNativeDriver: true
            }),
            Animated.timing(anim.x, {
              toValue: anim.x.__getValue() + (idx % 2 === 0 ? 18 : -18),
              duration: 3600 + idx * 120,
              useNativeDriver: true
            }),
            Animated.timing(anim.opacity, {
              toValue: 0.35,
              duration: 1800,
              useNativeDriver: true
            })
          ]),
          Animated.parallel([
            Animated.timing(anim.y, {
              toValue: anim.y.__getValue(),
              duration: 3600 + idx * 120,
              useNativeDriver: true
            }),
            Animated.timing(anim.x, {
              toValue: anim.x.__getValue(),
              duration: 3600 + idx * 120,
              useNativeDriver: true
            }),
            Animated.timing(anim.opacity, {
              toValue: 0.12,
              duration: 1800,
              useNativeDriver: true
            })
          ])
        ])
      )
    );

    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [floatAnims]);

  return (
    <View pointerEvents="none" style={styles.layer}>
      {floatAnims.map((anim, idx) => (
        <Animated.Text
          key={`note-${idx}`}
          style={[
            styles.note,
            {
              color: noteColor,
              transform: [{ translateX: anim.x }, { translateY: anim.y }],
              opacity: anim.opacity
            }
          ]}
        >
          {idx % 4 === 0 ? "♪" : idx % 4 === 1 ? "♫" : idx % 4 === 2 ? "♩" : "♬"}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  },
  note: {
    position: "absolute",
    fontSize: 20
  }
});

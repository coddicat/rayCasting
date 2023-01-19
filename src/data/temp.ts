// private findIntersection(point: {x: number, y: number}, angle: number, cycleCenter: {x: number, y: number}, cycleRadius: number): number | null {
//     // Find the intersection of the line defined by the point and angle with the circle defined by the cycle
//     const dx = Math.cos(angle);
//     const dy = Math.sin(angle);
//     const a = dx * dx + dy * dy;
//     const b = 2 * (dx * (point.x - cycleCenter.x) + dy * (point.y - cycleCenter.y));
//     const c = (point.x - cycleCenter.x) * (point.x - cycleCenter.x) +
//               (point.y - cycleCenter.y) * (point.y - cycleCenter.y) -
//               cycleRadius * cycleRadius;
//     const discriminant = b * b - 4 * a * c;
//     if (discriminant < 0) {
//       // No intersection
//       return null;
//     } else {
//       const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
//       const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
//       if (t1 >= 0 && t2 >= 0) {
//         // Both intersections are in the positive t direction, return the distance to the closer one
//         const d1 = t1 * t1;
//         const d2 = t2 * t2;
//         return Math.sqrt(d1 < d2 ? d1 : d2);
//       } else if (t1 >= 0) {
//         // Only intersection at t1 is in the positive t direction
//         return Math.sqrt(t1 * t1);
//       } else if (t2 >= 0) {
//         // Only intersection at t2 is in the positive t direction
//         return Math.sqrt(t2 * t2);
//       } else {
//         // No intersection in the positive t direction
//         return null;
//       }
//     }
//   }

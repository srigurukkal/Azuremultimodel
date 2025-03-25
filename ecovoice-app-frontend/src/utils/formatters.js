// Format time from seconds to MM:SS
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Calculate account age in days
export const calculateAccountAge = (createdDate) => {
  return Math.ceil(
    (new Date() - new Date(createdDate)) / (1000 * 60 * 60 * 24)
  );
};

// Format eco points with a + sign and thousands separator
export const formatEcoPoints = (points) => {
  return points > 0 ? `+${points.toLocaleString()}` : points.toLocaleString();
};

// Calculate level progression percentage
export const calculateLevelProgress = (level, totalPoints) => {
  switch (level) {
    case 1:
      return Math.min(100, (totalPoints / 50) * 100);
    case 2:
      return Math.min(100, ((totalPoints - 50) / 50) * 100);
    case 3:
      return Math.min(100, ((totalPoints - 100) / 150) * 100);
    case 4:
      return Math.min(100, ((totalPoints - 250) / 250) * 100);
    case 5:
      return 100; // Max level
    default:
      return 0;
  }
};

// Get next level threshold based on current level
export const getNextLevelThreshold = (level) => {
  switch (level) {
    case 1: return 50;
    case 2: return 100;
    case 3: return 250;
    case 4: return 500;
    case 5: return null; // Max level
    default: return 0;
  }
};

export default {
  formatTime,
  calculateAccountAge,
  formatEcoPoints,
  calculateLevelProgress,
  getNextLevelThreshold
};

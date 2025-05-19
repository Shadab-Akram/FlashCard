// Study settings schema
export const subjects = [
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "history", label: "History" },
  { value: "literature", label: "Literature" },
  { value: "general", label: "General Knowledge" }
] as const;

export const classLevels = [
  { value: "1", label: "Elementary" },
  { value: "2", label: "Middle School" },
  { value: "3", label: "High School" },
  { value: "college", label: "College" }
] as const;

export const difficultyLevels = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" }
] as const;

export const questionCounts = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 15, label: "15" }
] as const; 
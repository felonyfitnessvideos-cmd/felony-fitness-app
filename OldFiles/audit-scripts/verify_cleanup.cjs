const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://wkmrdelhoeqhsdifrarn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ");
(async () => {
  console.log("Verifying muscle group cleanup...");
  
  // Check some key exercises that were reassigned
  const { data: exercises, error } = await supabase
    .from("exercises")
    .select(`
      name,
      primary_muscle_groups:primary_muscle_group_id(name),
      secondary_muscle_groups:secondary_muscle_group_id(name),
      tertiary_muscle_groups:tertiary_muscle_group_id(name)
    `)
    .in("name", [
      "Deadlift", 
      "Barbell Row", 
      "Pull-up", 
      "Running", 
      "Sled Push",
      "Placeholder Exercise - 52c4b829"
    ])
    .order("name");
  
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  console.log("\\nKey exercises after cleanup:");
  exercises.forEach(ex => {
    console.log(`\\n${ex.name}:`);
    console.log(`  Primary: ${ex.primary_muscle_groups?.name || "NULL"}`);
    console.log(`  Secondary: ${ex.secondary_muscle_groups?.name || "NULL"}`);
    console.log(`  Tertiary: ${ex.tertiary_muscle_groups?.name || "NULL"}`);
  });
  
  // Check most common primary muscle groups now
  const { data: allPrimary, error: primaryError } = await supabase
    .from("exercises")
    .select("primary_muscle_groups:primary_muscle_group_id(name)")
    .not("primary_muscle_group_id", "is", null);
    
  if (!primaryError) {
    const groupCounts = {};
    allPrimary.forEach(ex => {
      const group = ex.primary_muscle_groups?.name;
      if (group) {
        groupCounts[group] = (groupCounts[group] || 0) + 1;
      }
    });
    
    console.log("\\nTop primary muscle groups after cleanup:");
    Object.entries(groupCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([group, count]) => {
        console.log(`  ${group}: ${count} exercises`);
      });
  }
})();

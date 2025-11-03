const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://wkmrdelhoeqhsdifrarn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ");
(async () => {
  console.log("Exercise muscle targeting statistics:");
  
  // Count exercises with each level of targeting
  const { data: stats, error } = await supabase
    .from("exercises")
    .select("primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id");
  
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  const primaryCount = stats.filter(e => e.primary_muscle_group_id).length;
  const secondaryCount = stats.filter(e => e.secondary_muscle_group_id).length;
  const tertiaryCount = stats.filter(e => e.tertiary_muscle_group_id).length;
  
  console.log(`Total exercises: ${stats.length}`);
  console.log(`Exercises with primary muscle targeting: ${primaryCount} (${Math.round(primaryCount/stats.length*100)}%)`);
  console.log(`Exercises with secondary muscle targeting: ${secondaryCount} (${Math.round(secondaryCount/stats.length*100)}%)`);
  console.log(`Exercises with tertiary muscle targeting: ${tertiaryCount} (${Math.round(tertiaryCount/stats.length*100)}%)`);
  
  // Most common primary muscle groups
  const { data: primaryGroups, error: primaryError } = await supabase
    .from("exercises")
    .select("primary_muscle_groups:primary_muscle_group_id(name)")
    .not("primary_muscle_group_id", "is", null);
    
  if (!primaryError) {
    const groupCounts = {};
    primaryGroups.forEach(ex => {
      const group = ex.primary_muscle_groups?.name;
      if (group) {
        groupCounts[group] = (groupCounts[group] || 0) + 1;
      }
    });
    
    console.log("\\nMost targeted primary muscle groups:");
    Object.entries(groupCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([group, count]) => {
        console.log(`  ${group}: ${count} exercises`);
      });
  }
})();

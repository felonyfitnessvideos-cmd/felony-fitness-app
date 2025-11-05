const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://wkmrdelhoeqhsdifrarn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ");
(async () => {
  console.log("FINAL AUDIT: Checking for any remaining vague muscle group usage...");
  
  const vagueGroupIds = {};
  const { data: vagueGroups, error: mgError } = await supabase
    .from("muscle_groups")
    .select("id, name")
    .in("name", ["General", "Back", "Legs", "Arms"]);
  
  if (mgError) {
    console.error("Error getting vague groups:", mgError);
    return;
  }
  
  vagueGroups.forEach(mg => {
    vagueGroupIds[mg.name] = mg.id;
  });
  
  let totalVagueUsage = 0;
  
  for (const [groupName, groupId] of Object.entries(vagueGroupIds)) {
    const { data: exercises, error: exError } = await supabase
      .from("exercises")
      .select("name")
      .or(`primary_muscle_group_id.eq.${groupId},secondary_muscle_group_id.eq.${groupId},tertiary_muscle_group_id.eq.${groupId}`);
    
    if (!exError) {
      if (exercises.length > 0) {
        console.log(`\\n❌ ${groupName}: Still used by ${exercises.length} exercises`);
        exercises.forEach(ex => console.log(`   - ${ex.name}`));
        totalVagueUsage += exercises.length;
      } else {
        console.log(`✅ ${groupName}: No longer used by any exercises`);
      }
    }
  }
  
  console.log(`\\n=== AUDIT SUMMARY ===`);
  if (totalVagueUsage === 0) {
    console.log("🎉 SUCCESS: All vague muscle group references have been eliminated!");
    console.log("The exercise database now uses only specific muscle groups.");
  } else {
    console.log(`⚠️  WARNING: ${totalVagueUsage} exercises still use vague muscle groups`);
  }
  
  // Show current top muscle groups
  const { data: currentStats, error: statsError } = await supabase
    .from("exercises")
    .select("primary_muscle_groups:primary_muscle_group_id(name)")
    .not("primary_muscle_group_id", "is", null);
    
  if (!statsError) {
    const groupCounts = {};
    currentStats.forEach(ex => {
      const group = ex.primary_muscle_groups?.name;
      if (group) {
        groupCounts[group] = (groupCounts[group] || 0) + 1;
      }
    });
    
    console.log("\\nCurrent top primary muscle groups:");
    Object.entries(groupCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .forEach(([group, count]) => {
        console.log(`  ${group}: ${count} exercises`);
      });
  }
})();

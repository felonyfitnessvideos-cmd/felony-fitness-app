const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://wkmrdelhoeqhsdifrarn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ");
(async () => {
  console.log("Finding exercises with vague muscle group targeting...");
  
  // Get muscle group IDs for vague categories
  const { data: muscleGroups, error: mgError } = await supabase
    .from("muscle_groups")
    .select("id, name")
    .in("name", ["General", "Back", "Legs", "Arms"]);
  
  if (mgError) {
    console.error("Error getting muscle groups:", mgError);
    return;
  }
  
  console.log("Vague muscle groups found:", muscleGroups.map(mg => `${mg.name} (${mg.id})`));
  
  for (const mg of muscleGroups) {
    console.log(`\\n=== EXERCISES USING "${mg.name.toUpperCase()}" ===`);
    
    // Check exercises using this muscle group in any position
    const { data: exercises, error: exError } = await supabase
      .from("exercises")
      .select(`
        name,
        primary_muscle_group_id,
        secondary_muscle_group_id,
        tertiary_muscle_group_id
      `)
      .or(`primary_muscle_group_id.eq.${mg.id},secondary_muscle_group_id.eq.${mg.id},tertiary_muscle_group_id.eq.${mg.id}`);
    
    if (!exError && exercises.length > 0) {
      exercises.forEach(ex => {
        const positions = [];
        if (ex.primary_muscle_group_id === mg.id) positions.push("Primary");
        if (ex.secondary_muscle_group_id === mg.id) positions.push("Secondary");
        if (ex.tertiary_muscle_group_id === mg.id) positions.push("Tertiary");
        console.log(`  - ${ex.name} (${positions.join(", ")})`);
      });
    } else if (exercises.length === 0) {
      console.log("  No exercises found using this muscle group");
    }
  }
})();

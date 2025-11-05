const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://wkmrdelhoeqhsdifrarn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ");
(async () => {
  console.log("Auditing vague muscle group usage...");
  
  const vagueGroups = ["General", "Back", "Legs", "Arms"];
  
  for (const group of vagueGroups) {
    console.log(`\\n=== ${group.toUpperCase()} MUSCLE GROUP ===`);
    
    // Check primary targeting
    const { data: primaryData, error: primaryError } = await supabase
      .from("exercises")
      .select("name")
      .eq("primary_muscle_groups.name", group)
      .not("primary_muscle_group_id", "is", null);
    
    if (!primaryError && primaryData.length > 0) {
      console.log(`Primary targeting (${primaryData.length} exercises):`);
      primaryData.forEach(ex => console.log(`  - ${ex.name}`));
    }
    
    // Check secondary targeting
    const { data: secondaryData, error: secondaryError } = await supabase
      .from("exercises")
      .select("name")
      .eq("secondary_muscle_groups.name", group)
      .not("secondary_muscle_group_id", "is", null);
    
    if (!secondaryError && secondaryData.length > 0) {
      console.log(`Secondary targeting (${secondaryData.length} exercises):`);
      secondaryData.forEach(ex => console.log(`  - ${ex.name}`));
    }
    
    // Check tertiary targeting
    const { data: tertiaryData, error: tertiaryError } = await supabase
      .from("exercises")
      .select("name")
      .eq("tertiary_muscle_groups.name", group)
      .not("tertiary_muscle_group_id", "is", null);
    
    if (!tertiaryError && tertiaryData.length > 0) {
      console.log(`Tertiary targeting (${tertiaryData.length} exercises):`);
      tertiaryData.forEach(ex => console.log(`  - ${ex.name}`));
    }
  }
})();

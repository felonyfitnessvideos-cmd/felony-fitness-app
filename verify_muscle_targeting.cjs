const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://wkmrdelhoeqhsdifrarn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ");
(async () => {
  console.log("Checking updated exercise muscle targeting...");
  const { data, error } = await supabase
    .from("exercises")
    .select(`
      name,
      primary_muscle_groups:primary_muscle_group_id(name),
      secondary_muscle_groups:secondary_muscle_group_id(name),
      tertiary_muscle_groups:tertiary_muscle_group_id(name)
    `)
    .in("name", ["Barbell Bench Press", "Pull-up", "Barbell Squat", "Barbell Curl", "Plank"])
    .order("name");
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Sample exercises with muscle targeting:");
    data.forEach(ex => {
      console.log(`\\n${ex.name}:`);
      console.log(`  Primary: ${ex.primary_muscle_groups?.name || "Not set"}`);
      console.log(`  Secondary: ${ex.secondary_muscle_groups?.name || "Not set"}`);
      console.log(`  Tertiary: ${ex.tertiary_muscle_groups?.name || "Not set"}`);
    });
  }
})();

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://wkmrdelhoeqhsdifrarn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ");
(async () => {
  console.log("All muscle groups with status:");
  const { data: muscleGroups, error } = await supabase
    .from("muscle_groups")
    .select("name, description")
    .order("name");
  
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  console.log("\\nActive muscle groups:");
  const active = muscleGroups.filter(mg => !mg.description || !mg.description.includes("DEPRECATED"));
  active.forEach(mg => {
    console.log(`  - ${mg.name}`);
  });
  
  console.log("\\nDeprecated muscle groups:");
  const deprecated = muscleGroups.filter(mg => mg.description && mg.description.includes("DEPRECATED"));
  deprecated.forEach(mg => {
    console.log(`  - ${mg.name} (${mg.description})`);
  });
  
  console.log(`\\nTotal: ${muscleGroups.length} (${active.length} active, ${deprecated.length} deprecated)`);
})();

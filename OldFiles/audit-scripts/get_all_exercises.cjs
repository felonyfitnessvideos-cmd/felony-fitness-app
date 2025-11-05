const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://wkmrdelhoeqhsdifrarn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ");
(async () => {
  console.log("Fetching all exercises...");
  const { data, error } = await supabase.from("exercises").select("id, name").order("name");
  if (error) {
    console.error("Error:", error);
  } else {
    console.log(`Found ${data.length} exercises:`);
    data.forEach((ex, i) => {
      console.log(`${i + 1}. ${ex.name} (${ex.id})`);
    });
  }
})();

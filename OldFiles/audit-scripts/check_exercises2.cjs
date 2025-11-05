const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://wkmrdelhoeqhsdifrarn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ");
(async () => {
  console.log("Fetching exercises...");
  const { data, error } = await supabase.from("exercises").select("*").limit(5);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Current exercises structure:");
    if (data && data.length > 0) {
      console.log("Columns:", Object.keys(data[0]));
      console.log("Sample data:", JSON.stringify(data[0], null, 2));
    } else {
      console.log("No data found");
    }
  }
})();

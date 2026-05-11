import app from "./app";
console.log("SERVER STARTED");
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
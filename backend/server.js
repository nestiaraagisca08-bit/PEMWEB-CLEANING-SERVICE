const app = require("./app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("====================================");
  console.log("Backend GriyaResik berhasil dijalankan");
  console.log(`URL        : http://localhost:${PORT}`);
  console.log(`SERVER FILE: ${__filename}`);
  console.log(`GOOGLE_CLIENT_ID tersedia: ${Boolean(process.env.GOOGLE_CLIENT_ID)}`);
  console.log(`JWT_SECRET tersedia: ${Boolean(process.env.JWT_SECRET)}`);
  console.log("====================================");
});

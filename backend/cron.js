import cron from "cron";
import https from "https";

const URL = "https://expense-tracker-ogbq.onrender.com";

const job = new cron.CronJob("/14 * * * *", function () {
  https
    .get(URL, (res) => {
      if (res.statusCode === 200) {
        console.log("Get request sent successfully: ", res.statusCode);
      } else {
        console.log("Get request failed: ", res.statusCode);
      }
    })
    .on("error", (err) => {
      console.error("Error while bsending request: ", err);
    });
});

export default job;

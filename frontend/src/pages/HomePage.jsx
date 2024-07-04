import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import Cards from "../components/Cards";
import TransactionForm from "../components/TransactionForm";

import { MdLogout } from "react-icons/md";
import { useMutation, useQuery } from "@apollo/client";
import { LOGOUT } from "../graphql/mutations/user.mutation";
import { GET_TRANSACTION_STATISTICS } from "../graphql/queries/transaction.query";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.query";
import { useEffect, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const HomePage = () => {
  const [chartSelect, setChartSelect] = useState("category");
  const { data } = useQuery(GET_TRANSACTION_STATISTICS);
  const { data: authUserData } = useQuery(GET_AUTHENTICATED_USER);
  console.log("data-------->", data);
  const [logout, { loading, client, error }] = useMutation(LOGOUT);

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "$",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
        borderRadius: 30,
        spacing: 10,
        cutout: 130,
      },
    ],
  });

  useEffect(() => {
    if (chartSelect === "category" && data?.categoryStatistics) {
      // console.log(data);
      const categories = data.categoryStatistics.map((stat) => stat.category);
      const totalAmount = data.categoryStatistics.map(
        (stat) => stat.totalAmount
      );
      const backgroundColors = [];
      const borderColors = [];

      categories.forEach((category) => {
        if (category === "saving") {
          backgroundColors.push("rgba(75,192,192");
          borderColors.push("rgba(75, 192,192)");
        } else if (category === "expense") {
          backgroundColors.push("rgba(255,99,132");
          borderColors.push("rgba(255, 99,132)");
        } else if (category === "investment") {
          backgroundColors.push("rgba(54,162,235");
          borderColors.push("rgba(54, 162,235)");
        }
      });
      setChartData((prev) => ({
        labels: categories,
        datasets: [
          {
            ...prev.datasets[0],
            data: totalAmount,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
          },
        ],
      }));
    }
    if (chartSelect === "location" && data?.locationStatistics) {
      // console.log(data);
      const locations = data.locationStatistics.map((stat) => stat.location);
      const totalAmount = data.locationStatistics.map(
        (stat) => stat.totalAmount
      );
      const backgroundColors = [];
      const borderColors = [];
      function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const backgroundAlpha = 0.4; // Adjust the alpha value for background color
        const borderAlpha = 1; // Alpha value for border color

        return {
          background: `rgba(${r},${g},${b},${backgroundAlpha})`,
          border: `rgba(${r},${g},${b},${borderAlpha})`,
        };
      }
      const colorMapping = {};
      locations.forEach((location) => {
        if (!colorMapping[location]) {
          colorMapping[location] = getRandomColor();
        }
        const colors = colorMapping[location];
        backgroundColors.push(colors.background);
        borderColors.push(colors.border);
      });

      setChartData((prev) => ({
        labels: locations,
        datasets: [
          {
            ...prev.datasets[0],
            data: totalAmount,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
          },
        ],
      }));
    }
  }, [data, chartSelect]);

  console.log("categoryStatistics", chartData);

  const handleLogout = async () => {
    try {
      await logout();
      console.log("client", client);
      client.resetStore();
    } catch (err) {
      console.log(err);
    }
  };

  // const loading = false;

  return (
    <>
      <div className="flex flex-col gap-6 items-center max-w-7xl mx-auto z-20 relative justify-center">
        <div className="flex items-center">
          <p className="md:text-4xl text-2xl lg:text-4xl font-bold text-center relative z-50 mb-4 mr-4 bg-gradient-to-r from-pink-600 via-indigo-500 to-pink-400 inline-block text-transparent bg-clip-text">
            Spend wisely, track wisely
          </p>
          <img
            src={authUserData?.authUser.profilePicture}
            className="w-11 h-11 rounded-full border cursor-pointer"
            alt="Avatar"
          />
          {!loading && (
            <MdLogout
              className="mx-2 w-5 h-5 cursor-pointer"
              onClick={handleLogout}
            />
          )}
          {/* loading spinner */}
          {loading && (
            <div className="w-6 h-6 border-t-2 border-b-2 mx-2 rounded-full animate-spin"></div>
          )}
        </div>
        <div className="flex justify-center gap-5">
          <button
            className={`category ${
              chartSelect === "category" &&
              "bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 active:bg-blue-800"
            }`}
            onClick={() => setChartSelect("category")}
          >
            Category
          </button>
          <button
            className={`${
              chartSelect === "location" &&
              "bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 active:bg-blue-800"
            }`}
            onClick={() => setChartSelect("location")}
          >
            Location
          </button>
        </div>
        <div className="flex flex-wrap w-full justify-center items-center gap-6">
          {chartSelect === "category" &&
            data?.categoryStatistics.length > 0 && (
              <div className="h-[330px] w-[330px] md:h-[360px] md:w-[360px]  ">
                <Doughnut data={chartData} />
              </div>
            )}
          {chartSelect === "location" &&
            data?.locationStatistics.length > 0 && (
              <div className="h-[330px] w-[330px] md:h-[360px] md:w-[360px]  ">
                <Doughnut data={chartData} />
              </div>
            )}

          <TransactionForm />
        </div>
        <Cards />
      </div>
    </>
  );
};
export default HomePage;

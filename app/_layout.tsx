import { useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import * as Location from "expo-location";

export default function RootLayout() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  type WeatherData = {
    current: {
      humidity_2m: number;
      wind_speed_10m: number;
      temperature_2m: number;
    };
    hourly: {
      relative_humidity_2m: number[];
      temperature_2m: number[];
      time: string[];
    };
  };

  // 🌍 Obtener ubicación
  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  // ☁️ Obtener datos del clima cuando la ubicación esté lista
  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&current=temperature_2m,wind_speed_10m&hourly=relative_humidity_2m,temperature_2m`;
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
        console.log("Weather API Response:", JSON.stringify(result, null, 2));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]); // 📌 Se ejecuta cuando `location` cambia

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {errorMsg ? (
        <Text style={styles.paragraph}>{errorMsg}</Text>
      ) : loading ? (
        <Text style={styles.paragraph}>Loading weather...</Text>
      ) : (
        <>
          <Text style={styles.paragraphTemperature}>
             {data?.current?.temperature_2m}°
          </Text>
          <Text style={styles.paragraphWind}>
            Wind speed: {data?.current?.wind_speed_10m} km/h
          </Text>

          {/* 📊 Gráfico de humedad */}
          {data?.hourly ? (
            <>
              <Text style={styles.title}>Humidity Levels</Text>
              <LineChart
                data={{
                  labels: data.hourly.time
                    .slice(0, 5)
                    .map((time) => time.split("T")[1]), // Extraer horas
                  datasets: [
                    {
                      data: data.hourly.relative_humidity_2m.slice(0, 5) || [],
                      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Color de la línea
                    },
                  ],
                }}
                width={250}
                height={100}
                yAxisSuffix="%"
                chartConfig={{
                  backgroundGradientFrom: "#f3f3f3",
                  backgroundGradientTo: "#e8e8e8",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 10,
                  },
                  propsForDots: {
                    r: "5",
                    strokeWidth: "2",
                    stroke: "#007AFF",
                  },
                }}
                bezier
                style={styles.chart}
              />
                <Text style={styles.title}>Temperature Levels</Text>
              <LineChart
                data={{
                  labels: data.hourly.time
                    .slice(0, 5)
                    .map((time) => time.split("T")[1]), // Extraer horas
                  datasets: [
                    {
                      data: data.hourly.temperature_2m.slice(0, 5) || [],
                      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Color de la línea
                    },
                  ],
                }}
                width={250}
                height={150}
                yAxisSuffix="°C"
                chartConfig={{
                  backgroundGradientFrom: "#f3f3f3",
                  backgroundGradientTo: "#e8e8e8",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 10,
                  },
                  propsForDots: {
                    r: "5",
                    strokeWidth: "2",
                    stroke: "#007AFF",
                  },
                }}
                bezier
                style={styles.chart}
              />
            </>
          ) : (
            <Text style={styles.paragraph}>Loading humidity data...</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  paragraph: {
    fontSize: 18,
    padding: 15,
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  chart: {
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
  },
  paragraphTemperature: {
    fontSize: 65,
    textAlign: "center",
    marginBottom: 10,
  },
  paragraphWind: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    shadowRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    backgroundColor: "#e8e8e8",
  },
});

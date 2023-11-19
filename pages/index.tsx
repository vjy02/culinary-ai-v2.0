import Layout from "../components/layout";
import foodImg from "../public/images/FooterBowl_Small.webp";
import Image from "next/image";
import foodTag from "../public/images/foodTag.png";
import { useRouter } from "next/router";

export default function IndexPage() {
  const router = useRouter();

  return (
    <Layout>
      <div className="flex justify-center w-[100%] h-[90vh] md:h-[80vh] text-lg sm:text-xl md:text-2xl">
        <div className="flex flex-col md:flex-row items-center justify-around md:justify-between w-[85%]">
          <div className="align-self-start flex flex-col md:w-[40%] gap-5 md:gap-10 mb-[5%]">
            <h1 className="text-2xl lg:text-4xl font-bold">
              Infinite flavors with <br />
              <a
                className="text-transparent bg-clip-text font-extrabold text-4xl lg:text-6xl"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #6ad803, #0a7425)",
                }}
              >
                AI Technology
              </a>
            </h1>
            <p className="leading-5 md:leading-9 mt-[-3%] text-sm md:text-l lg:text-xl">
              Where technology and taste unite, CulinaryAI offers a personalized
              journey through an array of delicious recipes. Our AI crafts
              unique dishes based on your preferences and dietary needs, turning
              every meal into a culinary masterpiece. Explore new flavors, enjoy
              tailored recommendations, and elevate your cooking experience with
              CulinaryAI.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="self-start pt-2 pb-2 pr-4 pl-4 md:pt-5 md:pb-5 md:pr-10 md:pl-10 rounded-lg bg-white-500 border-green-600 border-2 text-green-600 font-bold"
            >
              Try Now!
            </button>
          </div>
          <div className="relative md:w-[45%] md:h-[80%]">
            <Image src={foodImg} alt="food" height={600} width={600}></Image>
            <div className="absolute left-[-15%] md:bottom-[-20%] md:left-[-25%] w-[50%]">
              <Image
                src={foodTag}
                alt="food tag"
                height={250}
                width={250}
              ></Image>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

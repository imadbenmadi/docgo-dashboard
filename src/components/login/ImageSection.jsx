import React from "react";

export const ImageSection = () => {
  return (
    <section className="w-screen   h-screen max-md:ml-0 max-md:w-full">
      <div className="flex relative flex-col grow items-start px-3 pt-3.5 h-full  w-full rounded-[76px] max-md:pr-5 max-md:pb-24 max-md:mt-10 max-md:max-w-full">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/a21293058308930417577901d9b99a56b11b0984?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3"
          alt="Background"
          className="object-cover absolute inset-0 h-full size-full"
        />
      </div>
    </section>
  );
};

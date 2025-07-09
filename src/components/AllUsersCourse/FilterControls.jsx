"use client";
import * as React from "react";

export const FilterControls = () => {
  return (
    <div className="flex gap-4 items-center w-full text-zinc-800 max-md:max-w-full">
      <h1 className="self-stretch my-auto text-2xl font-semibold text-zinc-800">
        Tous les utilisateurs
      </h1>
      <div className="flex gap-4 items-center self-stretch my-auto text-sm min-w-60 max-md:max-w-full">
        <div className="flex gap-1 self-stretch px-4 py-2 my-auto rounded-2xl bg-stone-100 min-w-60">
          <div className="flex gap-2 justify-center items-center px-2 py-1 my-auto text-center bg-white rounded-lg">
            <span className="self-stretch my-auto text-zinc-800">
              Apprendre des cours
            </span>
          </div>
          <div className="flex gap-2 justify-center items-center px-2 h-full">
            <span className="self-stretch my-auto text-zinc-800">
              Étudier à l'étranger
            </span>
          </div>
          <div className="flex gap-2 justify-center items-center px-2 h-full whitespace-nowrap">
            <span className="self-stretch my-auto text-zinc-800">Tous</span>
          </div>
        </div>
        <div className="flex flex-col items-start self-stretch my-auto w-[194px]">
          <div className="flex gap-1 justify-center px-4 py-2 rounded-2xl border border border-solid min-h-[45px]">
            <div className="flex gap-2 justify-center items-center px-2 h-full">
              <span className="self-stretch my-auto text-zinc-800">
                Paiement effectué
              </span>
            </div>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e81a836057f1757e7bf2a5120d972a63ac44b388?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3"
              className="object-contain shrink-0 my-auto w-6 aspect-square"
              alt=""
            />
          </div>
        </div>
        <div className="self-stretch my-auto w-[170px]">
          <div className="flex gap-1 justify-center px-4 py-2 rounded-2xl border border border-solid min-h-[45px]">
            <div className="flex gap-2 justify-center items-center px-2 h-full">
              <span className="self-stretch my-auto text-zinc-800">
                Viber effectué
              </span>
            </div>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/8bc8dd971f5c6b30f0f5f3aa234148a7da6d74e1?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3"
              className="object-contain shrink-0 my-auto w-6 aspect-square"
              alt=""
            />
          </div>
        </div>
        <div className="self-stretch my-auto whitespace-nowrap">
          <div className="flex gap-1 justify-center py-2 pl-4 rounded-2xl border border border-solid min-h-[45px]">
            <div className="flex gap-2 justify-center items-center pl-2 h-full">
              <span className="self-stretch my-auto text-zinc-800">France</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

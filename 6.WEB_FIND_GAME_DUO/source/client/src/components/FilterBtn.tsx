import { useEffect, useState } from "react";
import styled from "styled-components";

function FilterBtn({ condition, setFilters, filters, type }: any) {
  return (
    <>
      {(filters && type === "position" && filters[0] !== condition) ||
      (filters && type === "tier" && filters[1] !== condition) ? (
        // off
        <button
          className="w-12 h-6 border border-gray-200 bg-gray-50 rounded-md flex justify-center items-center mr-1 shadow-md hover:bg-white"
          style={{ color: "#333d4b" }}
          onClick={() => {
            setFilters((old: any[]) => {
              if (condition.length > 1 && condition[0] !== "G") {
                // position
                const result = condition;
                return [result, old[1]];
              } else {
                const result = condition;
                return [old[0], result];
              }
            });
          }}
        >
          <p className="text-sm opacity-40">{condition}</p>
        </button>
      ) : (
        // on
        <button
          className="w-12 h-6 border border-gray-200 bg-green-400 rounded-md flex text-white justify-center items-center mr-1 shadow-md"
          onClick={() => {
            setFilters((old: any[]) => {
              if (condition.length > 1 && condition[0] !== "G") {
                const result = "";
                return [result, old[1]];
              } else {
                const result = "";
                return [old[0], result];
              }
            });
          }}
        >
          <p className="text-sm">{condition}</p>
        </button>
      )}
    </>
  );
}

export default FilterBtn;

import { useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import styled from "styled-components";
import { filtersState } from "../state";
import FilterBtn from "./FilterBtn";

function FilterBtnBox() {
  const [filters, setFilters] = useRecoilState(filtersState);
  return (
    <>
      <section className="flex flex-row mt-2">
        <FilterBtn
          condition="top"
          setFilters={setFilters}
          filters={filters}
          type="position"
        />
        <FilterBtn
          condition="jg"
          setFilters={setFilters}
          filters={filters}
          type="position"
        />
        <FilterBtn
          condition="mid"
          setFilters={setFilters}
          filters={filters}
          type="position"
        />
        <FilterBtn
          condition="adc"
          setFilters={setFilters}
          filters={filters}
          type="position"
        />
        <FilterBtn
          condition="sup"
          setFilters={setFilters}
          filters={filters}
          type="position"
        />
      </section>
      <section className="flex flex-row mt-2">
        <FilterBtn
          condition="I"
          setFilters={setFilters}
          type="tier"
          filters={filters}
        />
        <FilterBtn
          condition="B"
          setFilters={setFilters}
          type="tier"
          filters={filters}
        />
        <FilterBtn
          condition="S"
          setFilters={setFilters}
          type="tier"
          filters={filters}
        />
        <FilterBtn
          condition="G"
          setFilters={setFilters}
          type="tier"
          filters={filters}
        />
        <FilterBtn
          condition="P"
          setFilters={setFilters}
          type="tier"
          filters={filters}
        />
        <FilterBtn
          condition="D"
          setFilters={setFilters}
          type="tier"
          filters={filters}
        />
        <FilterBtn
          condition="M"
          setFilters={setFilters}
          type="tier"
          filters={filters}
        />
        <FilterBtn
          condition="GM"
          setFilters={setFilters}
          type="tier"
          filters={filters}
        />
        <FilterBtn
          condition="C"
          setFilters={setFilters}
          type="tier"
          filters={filters}
        />
      </section>
    </>
  );
}

export default FilterBtnBox;

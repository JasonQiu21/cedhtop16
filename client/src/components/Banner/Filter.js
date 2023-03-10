import { useEffect, useState, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";

export default function Filter({ getFilters }) {
  const [filters, setFilters] = useState({
    tourney_filter: { size: { $gte: 64 } },
  });
  const [openModal, setOpenModal] = useState(false);

  /**
   * Select function that keeps track of what filters you've selected
   * @TODO need to make string for the filters]
   */
  function select(filterBy, value, isTourneyFilter) {
    if (isTourneyFilter) {
      if (Object.keys(filters).includes("tourney_filter")) {
        // If tourney_filter exists
        let temp = { ...filters };
        if (!Object.keys(temp.tourney_filter).includes(filterBy)) {
          // If tourney_filter does not contain filterBy, append
          temp.tourney_filter = { ...temp.tourney_filter, [filterBy]: value };
        } else if (
          JSON.stringify(temp.tourney_filter[filterBy]) !==
          JSON.stringify(value)
        ) {
          // If tourney_filter contains filterBy and value is differemt, update
          temp.tourney_filter = { ...temp.tourney_filter, [filterBy]: value };
        } else {
          // If tourney_filter contains filterBy and value is the same, do nothing
          return;
        }
        setFilters(temp);
      } else {
        // If tourney_filter does not exist, create it
        setFilters({ ...filters, tourney_filter: { [filterBy]: value } });
      }
    } else {
      if (!Object.keys(filters).includes(filterBy)) {
        // If filters does not contain filterBy, append value
        setFilters({ ...filters, [filterBy]: value });
      } else {
        if (JSON.stringify(filters[filterBy]) !== JSON.stringify(value)) {
          // If filters contains filterBy and value is not the same, set filterBy
          setFilters({ ...filters, [filterBy]: value });
        } else {
          // If filters contsins filterBy and value is the same, do nothing
          return;
        }
      }
    }
  }

  function removeFilters(filterBy, isTourneyFilter) {
    if (isTourneyFilter) {
      if (Object.keys(filters).includes("tourney_filter")) {
        let temp = { ...filters };
        if (Object.keys(temp.tourney_filter).includes(filterBy)) {
          delete temp.tourney_filter[filterBy];
          setFilters(temp);
        }
      }
    } else {
      if (Object.keys(filters).includes(filterBy)) {
        // If filters does not contain filterBy, append value
        let temp = { ...filters };
        delete temp[filterBy];
        setFilters(temp);
      }
    }
  }

  function toggleModal() {
    if (openModal) {
      setOpenModal(false);
    } else {
      setOpenModal(true);
    }
  }

  function handleClear() {
    setFilters({});
    setOpenModal(false);
  }

  useEffect(() => {
    getFilters(filters);
    // console.log(filters);
  }, [filters]);

  return (
    <div className="mt-4">
      <div className="flex space-x-2 relative text-lg">
        {filters ? (
          Object.entries(filters).map((filter) => {
            if (filter[0] === "tourney_filter") {
              return Object.entries(filter[1]).map((_filter) => {
                return (
                  <AppliedFilter
                    filter={{ key: _filter[0], value: _filter[1] }}
                    isTourneyFilter={true}
                    removeFilters={removeFilters}
                  />
                );
              });
            } else {
              return (
                <AppliedFilter
                  filter={{ key: filter[0], value: filter[1] }}
                  isTourneyFilter={false}
                  removeFilters={removeFilters}
                />
              );
            }
          })
        ) : (
          <></>
        )}
        {/* <button onClick={() => select("standing", { $lte: 16 })}>Top 16</button>
        <button onClick={() => select("standing", { $lte: 4 })}>Top 4</button>
        <button onClick={() => select("standing", { $lte: 1 })}>Top 1</button>
        <button onClick={() => select("size", { $gte: 64 }, true)}>
          Size {">"}= 64
        </button>
        <button
          onClick={() => select("dateCreated", { $gte: 1670054400 }, true)}
        >
          Date {">"}= 1670054400
        </button>
         */}
        <button onClick={toggleModal}>+</button>
        <button onClick={() => handleClear()}>Clear</button>
      </div>

      {openModal ? (
        <Modal
          select={select}
          setOpenModal={setOpenModal}
          terms={[
            {
              name: "Standing",
              tag: "standing",
              cond: [
                { $gte: `is greater than (\u2265)` },
                { $eq: `is equal to (=)` },
                { $lte: `is less than (\u2264)` },
              ],
            },
            {
              name: "Tournament Size",
              tag: "size",
              isTourneyFilter: true,
              cond: [
                { $gte: `is greater than (\u2265)` },
                { $eq: `is equal to (=)` },
                { $lte: `is less than (\u2264)` },
              ],
            },
            {
              name: "Date",
              tag: "date",
              cond: [
                { $gte: `is greater than (\u2265)` },
                { $eq: `is equal to (=)` },
                { $lte: `is less than (\u2264)` },
              ],
            },
          ]}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

/**
 * @appliedfilter
 */
const AppliedFilter = ({ filter, isTourneyFilter, removeFilters }) => {
  let name = filter.key;
  let [val] = Object.entries(filter.value);
  let cond = val[0];
  if (cond === "$gte") {
    cond = "\u2265";
  } else if (cond === "$eq") {
    cond = "=";
  } else {
    cond = "\u2264";
  }
  let num = val[1];
  let parsed = `${name} ${cond} ${num}`;

  // switch (filter.key) {
  //   case ""
  // }

  // console.log(filter);

  return (
    <button className="flex items-center px-2 bg-nav text-white border-0 rounded-md">
      {isTourneyFilter ? "Tournament" : ""} {parsed}{" "}
      <button
        className="ml-4"
        onClick={() => removeFilters(filter.key, isTourneyFilter)}
      >
        <AiOutlineClose />
      </button>
    </button>
  );
};

/**
 * @modal
 */
const Modal = ({ select, setOpenModal, terms }) => {
  const inputRef = useRef(null);

  const [filterSelection, setFilterSelection] = useState(terms[0]);
  // console.log("f", filterSelection);
  const [checked, setChecked] = useState(
    Object.keys(filterSelection.cond[0])[0]
  );

  let conds = filterSelection.cond;

  function handleFilterSelection(x) {
    if (x !== filterSelection) {
      let [selected] = terms.filter((obj) => {
        if (obj.name === x) {
          return obj;
        }
      });

      setFilterSelection(selected);
    }
  }

  function handleCheckbox(e) {
    if (checked !== e.target.value) {
      setChecked(e.target.value);
    } else {
      setChecked("");
    }
  }

  function handleSubmit() {
    let filterObj = {};
    filterObj[checked] = Number(inputRef.current.value);
    console.log(filterSelection.tag);
    select(filterSelection.tag, filterObj, filterSelection.isTourneyFilter);
    setOpenModal(false);
  }

  return (
    <span className="absolute flex space-x-4 mt-4">
      {/* Filter selection */}
      <div className="max-w-max drop-shadow-xl flex flex-col overflow-clip items-start bg-nav border-0 rounded-lg h-min">
        {terms ? (
          terms.map((obj) => (
            <button
              className={`flex flex-wrap w-full px-4 py-2 text-lg text-white hover:bg-select ${
                obj.name === filterSelection.name ? "bg-select" : ""
              }`}
              onClick={() => handleFilterSelection(obj.name)}
            >
              {obj.name}
            </button>
          ))
        ) : (
          <></>
        )}
      </div>
      {/* Filter Values */}
      <div className="drop-shadow-xl flex flex-col items-start bg-nav border-0 rounded-lg h-min">
        {conds ? (
          conds.map((obj) => (
            <>
              <div className="px-4 py-2 space-x-2">
                <input
                  value={Object.keys(obj)[0]}
                  className="border-0 rounded-lg"
                  type="checkbox"
                  checked={checked === Object.keys(obj)[0]}
                  onChange={handleCheckbox}
                />

                <label className="text-lg text-white">
                  {Object.values(obj)[0]}
                </label>
              </div>
              {checked === Object.keys(obj)[0] ? (
                <input className="mx-4 my-2" type="number" ref={inputRef} />
              ) : (
                <></>
              )}
            </>
          ))
        ) : (
          <></>
        )}
        {/* Confirmations */}
        <div className="flex space-x-4 mx-4 my-2 text-white">
          <button onClick={handleSubmit}>Apply</button>
          <button onClick={() => setOpenModal(false)}>Cancel</button>
        </div>
      </div>
    </span>
  );
};

// Author: Chuan Wang
// Email: nauhcy@gmail.com

// This is a tutorial example: use React+Redux+SVG visualizing a matrix (random value).
// Each cell is represented by a circle, with the value reflected in the size
// This example is not the optimized program for such a task,
// as it is intended to show a framework for a more complex system.

// Also, the Actions, Reducers, Selectors ... should be separated to different files.
// (highly suggested when the program gets bigger =)
// Here all of them are piled together for easy understanding.

import React, { Component } from "react";
import ReactDOM from "react-dom";
import { createStore, compose } from "redux";
import { Provider, connect } from "react-redux";
import { handleActions, createAction } from "redux-actions";
import { createSelector } from "reselect";

// ---- Utilities ---- //
const arrInRange = N => {
  return Array.from({ length: N }, (v, k) => k);
};

// ---- Actions ---- //
// ACTION TYPE/ID
const LOAD_DATA = "LOAD_DATA";
const MOUSE_OVER_CIRCLE = "MOUSE_OVER_CIRCLE";
// ACTION
// load data for compnentDidMount.
// when laodData is called, the program will emit an action of ID 'LOAD_DATA'
const loadData = createAction(LOAD_DATA);
const mouseOverCircle = createAction(MOUSE_OVER_CIRCLE);

// ----  Reducers ---- // (reduce to new state)
// Redux root state tree
const DEFAULT_STATE = {
  data: [],
  mouseOveredId: null,
  mouseOveredCircleProps: {}
};

// const handleLoadData = (state, action) => {
//   // (state, action) => get payload from action  => (state, {payload})
//   console.log('handleLoadData', payload);
//   const { payload } = action;
//   return {
//     ...state,
//     data: payload
//   };
// };
const handleLoadData = (state, { payload }) => {
  // (state, action) => get payload from action  => (state, {payload})
  return {
    ...state,
    data: payload
  };
};
const handleMouseOverCircle = (state, { payload }) => {
  return {
    ...state,
    mouseOveredId: payload.target.id
  };
};

// map action ID to functions
const matrixReducer = handleActions(
  {
    [LOAD_DATA]: handleLoadData, // when LOAD_DATA is called, it triggers handleLoadData. // defination
    [MOUSE_OVER_CIRCLE]: handleMouseOverCircle
  },
  DEFAULT_STATE // initial state
);

// const matrixReducer = handleActions(
//   {
//     [MOUSE_OVER_CIRCLE]: (state, { payload }) => {
//       const { id } = payload;
//       return {
//         ...state,
//         id: id
//       }
//     }
//   },
//   DEFAULT_STATE
// );

//  ---- Selectors  ---- //
const rootSelector = state => state;
const getData = createSelector(rootSelector, state => {
  return state.data;
});
const getMouseOvered = createSelector(rootSelector, state => {
  return state.mouseOveredId;
  // {
  //   ...state,
  //   highlight: {
  //     r:
  //   }
  // }
});
const getHighlighted = createSelector([getData, getMouseOvered], (data, id) => {
  if (!data || data.length === 0 || !id) {
    return null;
  }
  // console.log('data, id', data, id);
  const [x, y] = id.split("-");
  // console.log(data[x][y]);
  return {
    x: parseInt(x),
    y: parseInt(y),
    r: data[x][y] + 2
  };
});

//  ----  Redux Utility Functions   ---- //
const mapDispatchToProps = {
  loadData,
  mouseOverCircle
};

const mapStateToProps = state => ({
  matrix: getData(state),
  mouseOveredId: getMouseOvered(state),
  mouseOveredCircleProps: getHighlighted(state)
});

// ---- React Component ---- //
class App extends Component {
  constructor(props, context) {
    super(props, context);

    // react compoent internal state, nothing to do with redux state
    // dont use the state from react in this example
    //     this.state = {
    //       matrix: [],
    //       highlight: 0
    //     };
  }

  componentDidMount() {
    const data = arrInRange(40).map(x => {
      return arrInRange(40).map(y => {
        return Math.ceil(Math.random() * 8);
      });
    });

    fetch("http://localhost:5000/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
      // body: JSON.stringify(data)
    })
      .then(res => {
        return res.json();
      })
      .then(data => {
        console.log(data);
      })
      .catch(err => console.log(err));

    this.props.loadData(data);
  }

  _renderRow() {
    const r = arrInRange(40).map(x => {
      return (
        <text key={x} x={50 + x * 15} y="30" fontSize="8px">
          {x}
        </text>
      );
    });
    return r;
  }
  _renderCol() {
    const c = arrInRange(40).map(x => {
      return (
        <text key={x} x="20" y={50 + x * 15} fontSize="8px">
          {x}
        </text>
      );
    });
    return c;
  }
  _renderMatrix(matrix, f) {
    const cells = matrix.map((x, idx) => {
      return (
        //rows
        x.map((y, idy) => {
          const xy = idx.toString() + "-" + idy.toString();
          return (
            <circle
              id={xy}
              key={xy}
              cx={50 + idx * 15}
              cy={50 + idy * 15}
              r={matrix[idx][idy]}
              fill="#044B94"
              opacity="0.4"
              onMouseOver={f}
            />
          );
        })
      );
    });
    return cells;
  }
  _renderHighlightCircle(element) {
    if (element) {
      return (
        <circle
          id={"highlightCircle"}
          key={"highlightCircle"}
          cx={50 + element.x * 15}
          cy={50 + element.y * 15}
          r={element.r}
          fill="none"
          stroke="red"
          strokeWidth="3"
          opacity="0.4"
        />
      );
    }
  }

  render() {
    const { matrix, mouseOveredId, mouseOveredCircleProps } = this.props;

    if (!matrix || matrix.length === 0) {
      return null;
    }

    const circleMatrix = this._renderMatrix(matrix, this.props.mouseOverCircle);
    const row = this._renderRow();
    const col = this._renderCol();

    const highlightCircle = this._renderHighlightCircle(mouseOveredCircleProps);

    return (
      <div>
        <svg height="800" width="800">
          {row}
          {col}
          <g>{circleMatrix}</g>
          {highlightCircle}
        </svg>
      </div>
    );
  }
}

// ---- Link Redux to React ---- //
const store = createStore(matrixReducer);
const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

// ---- Render! ---- //
ReactDOM.render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById("app")
);

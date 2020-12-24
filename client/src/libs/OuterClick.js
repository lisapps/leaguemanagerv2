import React, { useRef, useEffect } from "react";

//use a ref to access DOM elements because it will react will find it even if you mutate it
const OuterClick = (callback) => {
  const innerRef = useRef();
  const callbackRef = useRef();

  // set current callback in ref, before second useEffect uses it
  useEffect(() => {
    // useEffect wrapper to be safe for concurrent mode - this won't run until component is loaded from data
    callbackRef.current = callback;
  });

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);

    // read most recent callback and innerRef dom node from refs
    function handleClick(e) {
      if (
        innerRef.current &&
        callbackRef.current &&
        !innerRef.current.contains(e.target)
      ) {
        callbackRef.current(e);
      }
    }
  }, []); // no need for callback + innerRef dep

  return innerRef; // return ref; client can omit `useRef`
};

export default OuterClick;

/*
  Usage 
*/
// const Client = () => {
//   const [counter, setCounter] = useState(0);
//   const innerRef = useOuterClick(e => {
//     // counter state is up-to-date, when handler is called
//     alert(`Clicked outside! Increment counter to ${counter + 1}`);
//     setCounter(c => c + 1);
//   });
//   return (
//     <div>
//       <p>Click outside!</p>
//       <div id="container" ref={innerRef}>
//         Inside, counter: {counter}
//       </div>
//     </div>
//   );
// };

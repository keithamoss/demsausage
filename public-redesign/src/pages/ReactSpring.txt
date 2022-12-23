// import { useRef } from "react";
// import { BottomSheet, BottomSheetRef } from "react-spring-bottom-sheet";

// export default function Example() {
//   const sheetRef: any = useRef<BottomSheetRef>();

//   if (sheetRef !== undefined) {
//     return (
//       <BottomSheet open ref={sheetRef}>
//         <button
//           onClick={() => {
//             // Full typing for the arguments available in snapTo, yay!!
//             sheetRef.current.snapTo(
//               ({ maxHeight }: { maxHeight: number }) => maxHeight
//             );
//           }}
//         >
//           Expand to full height
//         </button>
//       </BottomSheet>
//     );
//   }

//   return null;
// }

import { Button } from "@mui/material";
import { useEffect, useState } from "react";
// import Button from '../../docs/fixtures/Button'
// import Code from '../../docs/fixtures/Code'
// // import Container from '../../docs/fixtures/Container'
// import Expandable from '../../docs/fixtures/Expandable'
// import Kbd from '../../docs/fixtures/Kbd'
// import SheetContent from '../../docs/fixtures/SheetContent'
import { BottomSheet } from "react-spring-bottom-sheet";

const SimpleFixturePage = () => {
  const [open, setOpen] = useState(false);

  // Ensure it animates in when loaded
  useEffect(() => {
    setOpen(true);
  }, []);

  function onDismiss() {
    setOpen(false);
  }

  return (
    <>
      <div>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <BottomSheet
          open={open}
          onDismiss={onDismiss}
          snapPoints={({ minHeight }) => minHeight}
        >
          <div>
            <p>
              Using <span>onDismiss</span> lets users close the sheet by swiping
              it down, tapping on the backdrop or by hitting <span>esc</span> on
              their keyboard.
            </p>
            <div>
              <div className="bg-gray-200 block rounded-md h-10 w-full my-10" />
              <p>
                The height adjustment is done automatically, it just works™!
              </p>
              <div className="bg-gray-200 block rounded-md h-10 w-full my-10" />
            </div>
            <Button onClick={onDismiss} className="w-full">
              Dismiss
            </Button>
          </div>
        </BottomSheet>
      </div>
    </>
  );
};

export default SimpleFixturePage;

import {
  GridToolbarDensitySelector,
  GridToolbarContainer,
  GridToolbarColumnsButton,
} from "@mui/x-data-grid";
import FlexBetween from "./FlexBetween";

const DataGridCustomToolbar = () => {
  return (
    <GridToolbarContainer>
      <FlexBetween width="100%">
        <FlexBetween>
          <GridToolbarColumnsButton />
          <GridToolbarDensitySelector />
        </FlexBetween>
      </FlexBetween>
    </GridToolbarContainer>
  );
};

export default DataGridCustomToolbar;

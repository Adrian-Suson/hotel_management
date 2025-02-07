import { Box, useTheme } from "@mui/material";
import PropTypes from "prop-types";

// FormSection for Children as Object
const FormSectionObject = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        padding: theme.spacing(2),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        marginBottom: theme.spacing(1),
      }}
    >
      {children.header && <Box>{children.header}</Box>}
      {children.content}
    </Box>
  );
};

FormSectionObject.propTypes = {
  children: PropTypes.shape({
    header: PropTypes.node,
    content: PropTypes.node.isRequired,
  }).isRequired,
};

// FormSection for Children as Function
const FormSectionFunction = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        padding: theme.spacing(2),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        marginBottom: theme.spacing(1),
      }}
    >
      {children()}
    </Box>
  );
};

FormSectionFunction.propTypes = {
  children: PropTypes.func.isRequired,
};

// FormSection for Children as Array
const FormSectionArray = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        padding: theme.spacing(1),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        marginBottom: theme.spacing(1),
      }}
    >
      {children}
    </Box>
  );
};

FormSectionArray.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

export { FormSectionObject, FormSectionFunction, FormSectionArray };

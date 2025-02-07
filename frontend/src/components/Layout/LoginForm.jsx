import PropTypes from "prop-types";
import { Box, TextField, Grid, IconButton, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

const LoginForm = ({
  profile,
  editing,
  handleChange,
  handleUpdate,
}) => {
  return (
    <Box>
      {editing ? (
        <>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Username"
                name="username"
                value={profile.username || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={profile.password || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
        </>
      ) : (
        <Typography variant="body1" gutterBottom>
          Username: {profile.username}
        </Typography>
      )}
      {editing && (
        <Box display="flex" justifyContent="space-between" mt={2}>
          <IconButton onClick={handleUpdate} sx={{ color: "primary.main" }}>
            <SaveIcon />
          </IconButton>

        </Box>
      )}
    </Box>
  );
};

LoginForm.propTypes = {
  profile: PropTypes.object.isRequired,
  editing: PropTypes.bool.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default LoginForm;

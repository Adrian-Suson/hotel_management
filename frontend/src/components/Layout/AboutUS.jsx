import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Avatar,
  Grid,
  IconButton,
  CardContent,
  Card,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AboutUsDialog = ({ open, onClose }) => {
  const developers = [
    {
      name: "Abdurasad, Allen S.",
      picture: "../../../assets/Allen.jpg",
      phone: "0936-4236-795",
      email: "skate.allen99@gmail.com",
    },
    {
      name: "Moh. Hashim, Rana",
      picture: "../../../assets/Rana.jpg",
      phone: "0955-970-1830",
      email: "ranamohammadhashim03@gmail.com",
    },
    {
      name: "Peñaflor, Angel",
      picture: "../../../assets/Angel.jpg",
      phone: "0905-828-5272",
      email: "penaflorangelm@gmail.com",
    },
    {
      name: "Suson, Adrian D.R",
      picture: "../../../assets/Adrian.jpg",
      phone: "0995-620-2850",
      email: "suson.adrian19@gmail.com",
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">About Us</Typography>
        <IconButton onClick={onClose} color="primary">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="h5" component="h2" gutterBottom mt={2}>
          Project Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The Zamboanga Peninsula Polytechnic State University- School of
          Business Administration Simulation and Training Hotel Management
          System is a project developed by Team A3R for students in the Bachelor
          of Science in Hospitality Management program at Zamboanga Peninsula
          Polytechnic State University. The system provides a hands-on learning
          experience by simulating hotel operations such as taking reservations,
          checking guests in and out, managing bills, and tracking guest
          histories. It is designed to give students practical skills needed in
          the hospitality industry through an interactive and accessible
          platform. A3R created the system to help bridge the gap between
          classroom learning and real-world application, ensuring that students
          are well-prepared for future careers in hotel management. The team is
          dedicated to enhancing education by providing tools that support
          experiential learning and skill development. Through this system, A3R
          aims to produce globally competent and industry-ready graduates,
          upholding the university&apos;s mission to deliver excellence in education
          and innovation.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom mt={4}>
          Meet the Team
        </Typography>
        <Grid container spacing={3}>
          {developers.map((developer) => (
            <Grid item xs={12} sm={6} md={3} key={developer.name}>
              <Card
                sx={{
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 3,
                  },
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar
                    src={developer.picture}
                    alt={developer.name}
                    sx={{ width: 100, height: 100, mb: 2, mx: "auto" }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {developer.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {developer.phone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {developer.email}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="body2" color="text.secondary" align="center" mt={4}>
          System Version: 1.10
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AboutUsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AboutUsDialog;

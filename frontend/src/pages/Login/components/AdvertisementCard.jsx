import PropTypes from "prop-types";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  useTheme,
  Box,
} from "@mui/material";
import config from "../../../state/config";

const AdvertisementCard = ({ advertisement,}) => {
  const theme = useTheme();

  const imageUrl = advertisement.image_url
    ? `${config.API_URL}/advertisements/${advertisement.image_url}`
    : "/assets/default-image.jpg";

  return (
    <Card
      sx={{
        height: "auto",
        position: "relative",
        mb: 3,
        boxShadow: theme.shadows[3],
        borderRadius: theme.shape.borderRadius,
        transition: "transform 0.3s",
        "&:hover": {
          boxShadow: theme.shadows[10],
          transform: "scale(1.05)",
          "& .MuiCardContent-root": {
            opacity: 1,
          },
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={imageUrl}
          alt={`Advertisement ${advertisement.title}`}
          sx={{
            width: "100%",
            height: "auto",
            borderTopLeftRadius: theme.shape.borderRadius,
            borderTopRightRadius: theme.shape.borderRadius,
          }}
        />
        <CardContent
          sx={{
            position: "absolute",
            bottom: 0,
            left: 2,
            right: 2,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            color: theme.palette.common.white,
            padding: theme.spacing(2),
            opacity: 0,
            transition: "opacity 0.3s",
          }}
        >
          <Typography gutterBottom variant="h5" component="div">
            {advertisement.title}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
};

AdvertisementCard.propTypes = {
  advertisement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
  }).isRequired,
};

export default AdvertisementCard;

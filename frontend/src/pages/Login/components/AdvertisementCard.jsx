import PropTypes from "prop-types";
import { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Skeleton,
  Fade,
  useTheme
} from "@mui/material";
import {
  ErrorOutline as ErrorIcon
} from "@mui/icons-material";
import config from "../../../state/config";

const AdvertisementCard = ({ advertisement, onClick }) => {
  const theme = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = advertisement.image_url
    ? `${config.API_URL}/advertisements/${advertisement.image_url}`
    : "/assets/default-image.jpg";

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  return (
    <Card
      elevation={3}
      sx={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        borderRadius: 2,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
        },
      }}
      onClick={onClick}
    >
      {/* Status Chip - for active/inactive/featured ads */}
      {advertisement.status && (
        <Chip
          label={advertisement.status}
          color={
            advertisement.status === "featured"
              ? "primary"
              : advertisement.status === "active"
              ? "success"
              : "default"
          }
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            fontWeight: 500,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        />
      )}

      {/* Image with loading state */}
      <Box sx={{ position: "relative", paddingTop: "56.25%" /* 16:9 Aspect Ratio */ }}>
        {!imageLoaded && !imageError && (
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "grey.200"
            }}
          />
        )}
        
        {imageError ? (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "grey.100",
            }}
          >
            <ErrorIcon color="action" sx={{ fontSize: 48, opacity: 0.6 }} />
          </Box>
        ) : (
          <CardMedia
            component="img"
            image={imageUrl}
            alt={advertisement.title || "Advertisement"}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
              "&:hover": {
                transform: "scale(1.05)"
              }
            }}
          />
        )}

        {/* Overlay gradient for text readability */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
            zIndex: 1
          }}
        />
      </Box>

      {/* Card Content */}
      <CardContent
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          zIndex: 2,
          p: theme.spacing(2),
          color: "#ffffff",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Title with character limit */}
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 600,
            textShadow: "0px 1px 3px rgba(0,0,0,0.6)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical"
          }}
        >
          {advertisement.title}
        </Typography>

        {/* Description with fade-in effect */}
        <Fade in={imageLoaded}>
          <Box>
            {advertisement.description && (
              <Typography
                variant="body2"
                sx={{
                  mb: 1.5,
                  opacity: 0.9,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical"
                }}
              >
                {advertisement.description}
              </Typography>
            )}
          </Box>
        </Fade>
      </CardContent>
    </Card>
  );
};

AdvertisementCard.propTypes = {
  advertisement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    image_url: PropTypes.string,
    description: PropTypes.string,
    url: PropTypes.string,
    status: PropTypes.string,
    valid_until: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func
};

export default AdvertisementCard;
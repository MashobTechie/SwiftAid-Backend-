const generateInitialsImageUrl = (firstname, lastname) => {
    const initials = `${firstname[0]}${lastname[0]}`.toUpperCase();
    const color = "FF0000"; // Red background color
    const textColor = "FFFFFF"; // White text color
    const size = 128;
    const url = `https://via.placeholder.com/${size}/${color}/${textColor}?text=${initials}`;
    return url;
  };
  
  module.exports = generateInitialsImageUrl;
  
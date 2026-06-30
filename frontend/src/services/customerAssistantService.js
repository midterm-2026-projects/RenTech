// FAQ + product recommendation service for customers.
// Replace with a real API call later.

// Sample product database (you can fetch this from an API or pass as prop)

const sampleProducts = [
  { id: 1, name: "Ivory Lace Gown", category: "wedding", color: "ivory", style: "classic" },
  { id: 2, name: "Satin Ballgown", category: "evening", color: "navy", style: "elegant" },
  { id: 3, name: "Velvet Cloak", category: "costume", color: "burgundy", style: "vintage" },
  { id: 4, name: "Floral Maxi Dress", category: "casual", color: "multi", style: "bohemian" },
  { id: 5, name: "Red Carpet Gown", category: "evening", color: "red", style: "glamorous" },
];

export const generateCustomerResponse = (
  input,
  context = [],
  products = sampleProducts
) => {
  products = products ?? sampleProducts;
  const lower = input.toLowerCase();

  //  FAQ Section 

  if (lower.includes("return") || lower.includes("refund")) {
    return "Our return policy allows returns within 14 days. Please visit your order page to initiate a return.";
  }

  if (lower.includes("size") || lower.includes("fit")) {
    return "You can find our size guide on each product page. If you need help, our stylists are here to assist!";
  }

  if (lower.includes("discount") || lower.includes("promo") || lower.includes("coupon")) {
    return "Sign up for our newsletter to get 10% off your first order! We also have seasonal promotions – check our homepage.";
  }

  //  Recommendation Section

  const wantsRecommendation =
    lower.includes("recommend") ||
    lower.includes("suggest") ||
    lower.includes("what should i") ||
    lower.includes("which") ||
    lower.includes("looking for");

  const mentionsProduct = ["wedding", "bride", "evening", "formal", "costume", "theme", "casual", "style", "stylish"].some(w => lower.includes(w));

  if (wantsRecommendation || mentionsProduct || lower.includes("gown") || lower.includes("dress")) {
    const mentions = (word) => lower.includes(word);

    let matches = [];

    if (mentions("wedding") || mentions("bride")) {
      matches = products.filter(p => p.category === "wedding");
    } else if (mentions("evening") || mentions("formal")) {
      matches = products.filter(p => p.category === "evening");
    } else if (mentions("costume") || mentions("theme")) {
      matches = products.filter(p => p.category === "costume");
    } else if (mentions("casual") || mentions("day")) {
      matches = products.filter(p => p.category === "casual");
    }

    if (matches.length === 0) {
      const colors = ["red", "blue", "green", "ivory", "navy", "burgundy", "multi"];
      for (const color of colors) {
        if (mentions(color)) {
          matches = products.filter(p => p.color === color);
          break;
        }
      }
    }

    if (matches.length === 0) {
      matches = products.slice(0, 3); // fallback: top 3 products
    }

    if (matches.length === 0) {
      return "We have a wide range of beautiful gowns! Could you tell me the occasion or color you prefer?";
    }

    const names = matches.map(p => `"${p.name}"`).join(", ");
    return `Based on your request, I recommend: ${names}. Would you like more details on any of these?`;
  }

  //  Fallback 

  return "I can help with returns, sizing, discounts, or finding the perfect gown. What would you like to know?";
};
import { InsertMenuItem } from "../shared/schema";

// Menu items from the Air Gourmet Hellas Menu PDF 2025
export const airGourmetMenuItems: InsertMenuItem[] = [
  // BREADS
  {
    name: "Assorted bread rolls",
    description: "Selection of freshly baked bread rolls",
    category: "breads",
    dietaryOptions: ["regular"],
    priceThessaloniki: 300, // €3.00
    priceMykonos: 350, // €3.50
    available: true,
    unit: "per piece"
  },
  {
    name: "Sourdough bread",
    description: "Traditional sourdough bread loaf",
    category: "breads",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 400, // €4.00
    priceMykonos: 450, // €4.50
    available: true,
    unit: "per loaf"
  },
  {
    name: "Bagels",
    description: "Fresh bagels",
    category: "breads",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 500, // €5.00
    priceMykonos: 900, // €9.00
    available: true,
    unit: "per piece"
  },
  {
    name: "Greek sesame bagel (Koulouri)",
    description: "Traditional Greek sesame bread ring",
    category: "breads",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 350, // €3.50
    priceMykonos: 570, // €5.70
    available: true,
    unit: "per piece"
  },
  {
    name: "Gluten free bread",
    description: "Specially made gluten-free bread",
    category: "breads",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 450, // €4.50
    priceMykonos: 570, // €5.70
    available: true,
    unit: "per loaf"
  },
  {
    name: "Pitta bread",
    description: "Traditional Greek flatbread",
    category: "breads",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 400, // €4.00
    priceMykonos: 650, // €6.50
    available: true,
    unit: "per pack"
  },
  
  // BREAKFAST
  {
    name: "Traditional bougatsa",
    description: "Traditional Greek pastry with cream, cheese, or spinach filling",
    category: "breakfast",
    dietaryOptions: ["regular"],
    priceThessaloniki: 1500, // €15.00
    priceMykonos: 2540, // €25.40
    available: true,
    unit: "per portion"
  },
  {
    name: "Traditional Greek pie",
    description: "Greek pastry filled with cheese, spinach, leek, beef, or chicken",
    category: "breakfast",
    dietaryOptions: ["regular"],
    priceThessaloniki: 1500, // €15.00
    priceMykonos: 2540, // €25.40
    available: true,
    unit: "per portion"
  },
  {
    name: "Classic pancake plain",
    description: "Fluffy plain pancakes that can be garnished",
    category: "breakfast",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1700, // €17.00
    priceMykonos: 2660, // €26.60
    available: true,
    unit: "per portion"
  },
  {
    name: "French toast plain",
    description: "Classic French toast that can be garnished",
    category: "breakfast",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1700, // €17.00
    priceMykonos: 2660, // €26.60
    available: true,
    unit: "per portion"
  },
  {
    name: "Breakfast garnishing",
    description: "Butter, thyme honey, marmalade, salted caramel, maple syrup, berries",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 400, // €4.00
    priceMykonos: 600, // €6.00
    available: true,
    unit: "per option"
  },
  {
    name: "Quiche",
    description: "Savory pastry with various fillings",
    category: "breakfast",
    dietaryOptions: ["regular"],
    priceThessaloniki: 2000, // €20.00
    priceMykonos: 2850, // €28.50
    available: true,
    unit: "per portion"
  },
  {
    name: "French croissant",
    description: "Buttery French pastry",
    category: "breakfast",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 800, // €8.00
    priceMykonos: 1550, // €15.50
    available: true,
    unit: "per piece"
  },
  {
    name: "Chocolate croissant",
    description: "Buttery French pastry filled with chocolate",
    category: "breakfast",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 850, // €8.50
    priceMykonos: 1550, // €15.50
    available: true,
    unit: "per piece"
  },
  {
    name: "Pain au raisin",
    description: "Sweet bread with raisins",
    category: "breakfast",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 700, // €7.00
    priceMykonos: 1550, // €15.50
    available: true,
    unit: "per piece"
  },
  {
    name: "Chocolate muffin",
    description: "Freshly baked chocolate muffin",
    category: "breakfast",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 900, // €9.00
    priceMykonos: 1650, // €16.50
    available: true,
    unit: "per piece"
  },
  {
    name: "Blueberry muffin",
    description: "Freshly baked blueberry muffin",
    category: "breakfast",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 900, // €9.00
    priceMykonos: 1650, // €16.50
    available: true,
    unit: "per piece"
  },
  {
    name: "Mini breakfast pastries",
    description: "Assortment of small breakfast pastries",
    category: "breakfast",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 500, // €5.00
    priceMykonos: 950, // €9.50
    available: true,
    unit: "per piece"
  },
  {
    name: "Greek yogurt plain",
    description: "Authentic Greek yogurt that can be garnished",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 1100, // €11.00
    priceMykonos: 1590, // €15.90
    available: true,
    unit: "per portion"
  },
  {
    name: "Yogurt garnishing",
    description: "Fresh or dried fruits, nuts, honey, marmalade, berries, chocolate chips",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 500, // €5.00
    priceMykonos: 600, // €6.00
    available: true,
    unit: "per option"
  },
  {
    name: "Organic muesli",
    description: "Healthy mix of oats, nuts, and dried fruits",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 1880, // €18.80
    available: true,
    unit: "per portion"
  },
  {
    name: "Corn flakes with milk",
    description: "Classic breakfast cereal with milk",
    category: "breakfast",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1100, // €11.00
    priceMykonos: 1880, // €18.80
    available: true,
    unit: "per portion"
  },
  {
    name: "Porridge",
    description: "Hot breakfast cereal made from oats",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 1880, // €18.80
    available: true,
    unit: "per portion"
  },
  {
    name: "Granola",
    description: "Baked oats with nuts and honey",
    category: "breakfast",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 1880, // €18.80
    available: true,
    unit: "per portion"
  },
  {
    name: "Rice pudding",
    description: "Creamy rice dessert, often served for breakfast",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 1880, // €18.80
    available: true,
    unit: "per portion"
  },
  {
    name: "Plain eggs",
    description: "Prepared according to your preference (scrambled, sunny side up, poached, omelets, soft-boiled)",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 1900, // €19.00
    priceMykonos: 2500, // €25.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Omelet with 2 toppings",
    description: "Custom omelet with two toppings of your choice",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 2500, // €25.00
    priceMykonos: 3000, // €30.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Egg garnishing (30gr)",
    description: "Cherry tomatoes, avocado, grilled tomatoes, cheese, grilled mushrooms, fresh herbs",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 500, // €5.00
    priceMykonos: 800, // €8.00
    available: true,
    unit: "per option"
  },
  {
    name: "Premium egg garnishing",
    description: "Ham, bacon, smoked salmon, gruyere, fresh truffle",
    category: "breakfast",
    dietaryOptions: ["regular"],
    priceThessaloniki: 700, // €7.00
    priceMykonos: 800, // €8.00
    available: true,
    unit: "per option"
  },
  {
    name: "Crispy bacon",
    description: "Choice of pork, turkey, or vegan bacon",
    category: "breakfast",
    dietaryOptions: ["regular", "vegan"],
    priceThessaloniki: 1500, // €15.00
    priceMykonos: 3200, // €32.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Grilled sausages",
    description: "Choice of pork, turkey, chicken, or vegan sausages",
    category: "breakfast",
    dietaryOptions: ["regular", "vegan"],
    priceThessaloniki: 1900, // €19.00
    priceMykonos: 3200, // €32.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Boiled sausages",
    description: "Choice of pork, turkey, or chicken sausages",
    category: "breakfast",
    dietaryOptions: ["regular"],
    priceThessaloniki: 1900, // €19.00
    priceMykonos: 3200, // €32.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Grilled tomatoes",
    description: "Seasoned tomatoes grilled to perfection",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 1500, // €15.00
    priceMykonos: 1970, // €19.70
    available: true,
    unit: "per portion"
  },
  {
    name: "Classic eggs benedict",
    description: "With bacon or salmon, topped with hollandaise sauce",
    category: "breakfast",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3500, // €35.00
    priceMykonos: 4090, // €40.90
    available: true,
    unit: "per portion"
  },
  {
    name: "Soft boiled eggs and caviar",
    description: "Luxurious breakfast with caviar",
    category: "breakfast",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5000, // €50.00
    priceMykonos: 5490, // €54.90
    available: true,
    unit: "per portion"
  },
  {
    name: "Avocado toast",
    description: "With heirloom tomatoes and fresh sprouts",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 2800, // €28.00
    priceMykonos: 3590, // €35.90
    available: true,
    unit: "per portion"
  },
  {
    name: "Butter in portions",
    description: "Individual butter portions",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 240, // €2.40
    priceMykonos: 400, // €4.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Jam in jar",
    description: "Assorted fruit preserves",
    category: "breakfast",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 700, // €7.00
    priceMykonos: 900, // €9.00
    available: true,
    unit: "per jar"
  },
  
  // FRUITS AND BERRIES
  {
    name: "Seasonal fruits sliced",
    description: "Assortment of freshly sliced seasonal fruits",
    category: "fruits",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 3840, // €38.40
    available: true,
    unit: "per platter"
  },
  {
    name: "Seasonal fruits sliced with berries",
    description: "Freshly sliced seasonal fruits with assorted berries",
    category: "fruits",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 3500, // €35.00
    priceMykonos: 4550, // €45.50
    available: true,
    unit: "per platter"
  },
  {
    name: "Exotic fruits sliced",
    description: "Assortment of sliced exotic fruits",
    category: "fruits",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 4000, // €40.00
    priceMykonos: 5650, // €56.50
    available: true,
    unit: "per platter"
  },
  {
    name: "Selection of fresh berries",
    description: "Assortment of fresh seasonal berries",
    category: "fruits",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 4500, // €45.00
    priceMykonos: 6040, // €60.40
    available: true,
    unit: "per platter"
  },
  {
    name: "Seasonal or exotic fruit basket",
    description: "Assorted fruits in a basket",
    category: "fruits",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 600, // €6.00
    priceMykonos: 680, // €6.80
    available: true,
    unit: "per passenger"
  },
  {
    name: "Fresh fruit skewers (small)",
    description: "Fresh fruit on small skewers",
    category: "fruits",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 1100, // €11.00
    priceMykonos: 1200, // €12.00
    available: true,
    unit: "per piece"
  },
  {
    name: "Fresh fruit skewers (large)",
    description: "Fresh fruit on large skewers",
    category: "fruits",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 1480, // €14.80
    available: true,
    unit: "per piece"
  },
  
  // MILK
  {
    name: "Whole milk (1ltr)",
    description: "Fresh whole milk",
    category: "beverage",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 700, // €7.00
    priceMykonos: 950, // €9.50
    available: true,
    unit: "1 liter"
  },
  {
    name: "Whole milk (0.5ltr)",
    description: "Fresh whole milk in smaller quantity",
    category: "beverage",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 400, // €4.00
    priceMykonos: 650, // €6.50
    available: true,
    unit: "0.5 liter"
  },
  {
    name: "Semi-skimmed milk (1ltr)",
    description: "Fresh semi-skimmed milk",
    category: "beverage",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 700, // €7.00
    priceMykonos: 950, // €9.50
    available: true,
    unit: "1 liter"
  },
  {
    name: "Lactose free milk (1ltr)",
    description: "Milk suitable for lactose intolerant individuals",
    category: "beverage",
    dietaryOptions: ["vegetarian", "gluten-free", "lactose-free"],
    priceThessaloniki: 800, // €8.00
    priceMykonos: 1350, // €13.50
    available: true,
    unit: "1 liter"
  },
  {
    name: "Plant-based milk (1ltr)",
    description: "Choice of soy milk, almond milk, coconut milk, or oat milk",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free", "lactose-free"],
    priceThessaloniki: 800, // €8.00
    priceMykonos: 1350, // €13.50
    available: true,
    unit: "1 liter"
  },
  
  // SALADS
  {
    name: "Premium Greek salad",
    description: "Cherry tomatoes from Santorini, variety of colorful tomatoes, cucumber, campers, samphire, olives from Kalamata, carob rusk, feta cheese, oregano",
    category: "salad",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 3500, // €35.00
    priceMykonos: 4650, // €46.50
    available: true,
    unit: "300g"
  },
  {
    name: "Greek salad",
    description: "Tomatoes, cucumber, peppers, olives, wholegrain rusk, feta cheese, oregano",
    category: "salad",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 2800, // €28.00
    priceMykonos: 4050, // €40.50
    available: true,
    unit: "300g"
  },
  {
    name: "Caesar salad",
    description: "Hearts of lettuce, parmesan cheese, croutons, grilled chicken, caesar dressing",
    category: "salad",
    dietaryOptions: ["regular"],
    priceThessaloniki: 2800, // €28.00
    priceMykonos: 4050, // €40.50
    available: true,
    unit: "300g"
  },
  {
    name: "Caesar salad with prawns",
    description: "Hearts of lettuce, parmesan cheese, croutons, grilled prawns, caesar dressing",
    category: "salad",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3600, // €36.00
    priceMykonos: 4650, // €46.50
    available: true,
    unit: "300g"
  },
  {
    name: "Premium Caprese",
    description: "Tomatoes, burrata, fresh basil, pesto, balsamic cream",
    category: "salad",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 4650, // €46.50
    available: true,
    unit: "300g"
  },
  {
    name: "Caprese",
    description: "Tomatoes, mozzarella, fresh basil, pesto",
    category: "salad",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 2700, // €27.00
    priceMykonos: 4050, // €40.50
    available: true,
    unit: "300g"
  },
  {
    name: "Mixed green salad",
    description: "Lettuce, lollo rosso, iceberg, arugula, croutons, cherry tomatoes, cucumber",
    category: "salad",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 2500, // €25.00
    priceMykonos: 3880, // €38.80
    available: true,
    unit: "300g"
  },
  {
    name: "Cobb salad",
    description: "Romaine lettuce, boiled eggs, avocado, tomatoes, cucumber, crispy bacon, grilled chicken, roquefort cheese",
    category: "salad",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3500, // €35.00
    priceMykonos: 4650, // €46.50
    available: true,
    unit: "300g"
  },
  {
    name: "Tabbouleh",
    description: "Bulgur, spring onions, tomatoes, parsley, mint, lime juice",
    category: "salad",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 2500, // €25.00
    priceMykonos: 3810, // €38.10
    available: true,
    unit: "300g"
  },
  {
    name: "Premium Nicoise",
    description: "Lettuce hearts, fresh grilled tuna cooked medium-rare, fresh beans, cherry tomatoes, quail egg, anchovy, nicoise dressing, potatoes, olives",
    category: "salad",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3500, // €35.00
    priceMykonos: 5010, // €50.10
    available: true,
    unit: "300g"
  },
  {
    name: "Nicoise",
    description: "Lettuce hearts, tuna, olives, boiled potatoes, cherry tomatoes, fresh beans, boiled egg, anchovy, nicoise dressing",
    category: "salad",
    dietaryOptions: ["regular"],
    priceThessaloniki: 2500, // €25.00
    priceMykonos: 4350, // €43.50
    available: true,
    unit: "300g"
  },
  {
    name: "Greens and quinoa",
    description: "Superfood salad with chia, raisins, berries, cashews",
    category: "salad",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 4510, // €45.10
    available: true,
    unit: "300g"
  },
  {
    name: "Arugula salad",
    description: "Arugula with prawns, avocado, parmesan cheese",
    category: "salad",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 3500, // €35.00
    priceMykonos: 5030, // €50.30
    available: true,
    unit: "300g"
  },
  {
    name: "Crab salad",
    description: "Colorful quinoa, avocado, mango, crab, cocktail sauce, fresh sprouts",
    category: "salad",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 4000, // €40.00
    priceMykonos: 5880, // €58.80
    available: true,
    unit: "300g"
  },
  {
    name: "Tuna salad",
    description: "Fresh tuna with mixed greens and vegetables",
    category: "salad",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 3500, // €35.00
    priceMykonos: 4810, // €48.10
    available: true,
    unit: "300g"
  },
  {
    name: "Egg salad",
    description: "Classic egg salad with mayonnaise",
    category: "salad",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 2200, // €22.00
    priceMykonos: 3500, // €35.00
    available: true,
    unit: "300g"
  },
  
  // STARTERS
  {
    name: "Beef carpaccio",
    description: "Thinly sliced raw beef, seasoned and served with garnishes",
    category: "starter",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 4500, // €45.00
    priceMykonos: 7830, // €78.30
    available: true,
    unit: "per portion"
  },
  {
    name: "Fish carpaccio",
    description: "Thinly sliced raw fish, seasoned and served with garnishes",
    category: "starter",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5500, // €55.00
    priceMykonos: 7830, // €78.30
    available: true,
    unit: "per portion"
  },
  {
    name: "Fish tartar",
    description: "Fresh fish diced and seasoned",
    category: "starter",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5000, // €50.00
    priceMykonos: 7830, // €78.30
    available: true,
    unit: "per portion"
  },
  {
    name: "Stuffed vine leaves (dolmades)",
    description: "Grape leaves stuffed with rice and herbs",
    category: "starter",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 1800, // €18.00
    priceMykonos: 3530, // €35.30
    available: true,
    unit: "per portion"
  },
  {
    name: "Fava from Santorini with grilled octopus",
    description: "Traditional Greek yellow split pea puree with octopus",
    category: "starter",
    dietaryOptions: ["gluten-free"],
    priceThessaloniki: 4900, // €49.00
    priceMykonos: 6030, // €60.30
    available: true,
    unit: "per portion"
  },
  {
    name: "Smoked grilled eggplant with regional cheese",
    description: "Smoky eggplant topped with local cheese",
    category: "starter",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 3500, // €35.00
    priceMykonos: 3530, // €35.30
    available: true,
    unit: "per portion"
  },
  {
    name: "Grilled haloumi with tomato marmalade",
    description: "Cypriot cheese grilled and served with tomato marmalade",
    category: "starter",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 2000, // €20.00
    priceMykonos: 3530, // €35.30
    available: true,
    unit: "per portion"
  },
  {
    name: "Grilled talagani with peach chutney",
    description: "Greek cheese grilled and served with peach chutney",
    category: "starter",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 2500, // €25.00
    priceMykonos: 3530, // €35.30
    available: true,
    unit: "per portion"
  },
  {
    name: "Gruyere wrapped in filo pastry",
    description: "Greek gruyere cheese wrapped in crispy filo dough",
    category: "starter",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 2500, // €25.00
    priceMykonos: 3530, // €35.30
    available: true,
    unit: "per portion"
  },
  {
    name: "Fried zucchini balls with herb yogurt sauce",
    description: "Zucchini fritters served with yogurt dip",
    category: "starter",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 2400, // €24.00
    priceMykonos: 3630, // €36.30
    available: true,
    unit: "per portion"
  },
  {
    name: "Meatballs with pita bread and eggplant salad",
    description: "Greek meatballs served with pita and eggplant dip",
    category: "starter",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3300, // €33.00
    priceMykonos: 4230, // €42.30
    available: true,
    unit: "per portion"
  },
  {
    name: "Falafel with pita bread and tahini sauce",
    description: "Middle Eastern chickpea fritters with tahini",
    category: "starter",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 3850, // €38.50
    available: true,
    unit: "per portion"
  },
  {
    name: "Spreads 200gr",
    description: "Choice of tarama, eggplant, tzatziki, hummus, feta cheese spread",
    category: "starter",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1600, // €16.00
    priceMykonos: 2530, // €25.30
    available: true,
    unit: "200g"
  },
  {
    name: "Selection of green and black olives",
    description: "Assorted Greek olives",
    category: "starter",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 900, // €9.00
    priceMykonos: 1580, // €15.80
    available: true,
    unit: "100g"
  },
  
  // MAIN COURSES - FISH AND SEAFOOD
  {
    name: "Fish fillet",
    description: "Choice of dorado or sea bass fillet",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 6750, // €67.50
    priceMykonos: 7630, // €76.30
    available: true,
    unit: "350g"
  },
  {
    name: "Salmon",
    description: "Fresh salmon fillet",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 6950, // €69.50
    priceMykonos: 8010, // €80.10
    available: true,
    unit: "350g"
  },
  {
    name: "Swordfish",
    description: "Grilled swordfish steak",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 8350, // €83.50
    priceMykonos: 8010, // €80.10
    available: true,
    unit: "350g"
  },
  {
    name: "Codfish",
    description: "Fresh codfish fillet",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 6350, // €63.50
    priceMykonos: 7220, // €72.20
    available: true,
    unit: "350g"
  },
  {
    name: "Fish cutlets",
    description: "Breaded fish cutlets",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 5850, // €58.50
    priceMykonos: 6850, // €68.50
    available: true,
    unit: "350g"
  },
  {
    name: "Red mullet",
    description: "Traditional Greek fish delicacy",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 7850, // €78.50
    priceMykonos: 8830, // €88.30
    available: true,
    unit: "350g"
  },
  {
    name: "Sea bream",
    description: "Fresh sea bream fillet",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 6750, // €67.50
    priceMykonos: 8010, // €80.10
    available: true,
    unit: "350g"
  },
  {
    name: "Sea bass with courgette spaghetti and lemon sauce",
    description: "Sea bass fillet served with zucchini noodles",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 7350, // €73.50
    priceMykonos: 9010, // €90.10
    available: true,
    unit: "350g"
  },
  {
    name: "Sea bream with wild greens and egg-lemon sauce",
    description: "Sea bream fillet with traditional avgolemono sauce",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 7350, // €73.50
    priceMykonos: 9010, // €90.10
    available: true,
    unit: "350g"
  },
  {
    name: "Red mullet savoro",
    description: "With sour-sweet sauce (wine, vinegar, raisins, rosemary)",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 8850, // €88.50
    priceMykonos: 9630, // €96.30
    available: true,
    unit: "350g"
  },
  {
    name: "Codfish tempura with walnut sauce",
    description: "Cod in light tempura batter with walnut sauce",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 6850, // €68.50
    priceMykonos: 7880, // €78.80
    available: true,
    unit: "350g"
  },
  {
    name: "Grilled octopus",
    description: "Tender octopus grilled with olive oil and lemon",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5550, // €55.50
    priceMykonos: 7000, // €70.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Grilled or fried squid",
    description: "Fresh squid prepared to your preference",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3900, // €39.00
    priceMykonos: 6780, // €67.80
    available: true,
    unit: "per portion"
  },
  {
    name: "King prawns",
    description: "Large prawns prepared to your preference",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 9400, // €94.00
    priceMykonos: 9550, // €95.50
    available: true,
    unit: "per portion"
  },
  {
    name: "Langoustines",
    description: "Norway lobsters prepared to your preference",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 8000, // €80.00
    priceMykonos: 7680, // €76.80
    available: true,
    unit: "per portion"
  },
  {
    name: "Scallops",
    description: "Fresh scallops prepared to your preference",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 7400, // €74.00
    priceMykonos: 8030, // €80.30
    available: true,
    unit: "per portion"
  },
  {
    name: "Shrimps",
    description: "Grilled or saganaki (shrimp stew with tomato and feta cheese)",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5000, // €50.00
    priceMykonos: 7680, // €76.80
    available: true,
    unit: "per portion"
  },
  {
    name: "Lobster",
    description: "Fresh lobster prepared to your preference",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 13000, // €130.00
    priceMykonos: 13550, // €135.50
    available: true,
    unit: "700g"
  },
  {
    name: "Squid stuffed",
    description: "Squid filled with herbs and other ingredients",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 5000, // €50.00
    priceMykonos: 7880, // €78.80
    available: true,
    unit: "per portion"
  },
  
  // SUSHI AND SASHIMI
  {
    name: "Nigiri",
    description: "Japanese hand-pressed sushi with various toppings",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5750, // €57.50
    priceMykonos: 6850, // €68.50
    available: true,
    unit: "per set"
  },
  {
    name: "Maki",
    description: "Japanese rolled sushi with various fillings",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5550, // €55.50
    priceMykonos: 6850, // €68.50
    available: true,
    unit: "per set"
  },
  {
    name: "Sashimi",
    description: "Japanese style thinly sliced raw fish",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5750, // €57.50
    priceMykonos: 6850, // €68.50
    available: true,
    unit: "per set"
  },
  
  // POULTRY
  {
    name: "Chicken breast",
    description: "Tender chicken breast prepared to your preference",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 4000, // €40.00
    priceMykonos: 5000, // €50.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Turkey breast",
    description: "Lean turkey breast prepared to your preference",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 4700, // €47.00
    priceMykonos: 6010, // €60.10
    available: true,
    unit: "per portion"
  },
  {
    name: "Duck breast",
    description: "Succulent duck breast prepared to your preference",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 6700, // €67.00
    priceMykonos: 7610, // €76.10
    available: true,
    unit: "per portion"
  },
  {
    name: "Whole roasted baby chicken",
    description: "Small chicken roasted whole",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5200, // €52.00
    priceMykonos: 6450, // €64.50
    available: true,
    unit: "per portion"
  },
  {
    name: "Chicken tabaka",
    description: "Georgian-style flattened fried chicken",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 4700, // €47.00
    priceMykonos: 6450, // €64.50
    available: true,
    unit: "per portion"
  },
  {
    name: "Grilled chicken thigh",
    description: "Juicy chicken thigh prepared on the grill",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 3800, // €38.00
    priceMykonos: 5000, // €50.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Chicken skewers",
    description: "Marinated chicken pieces on skewers",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 3900, // €39.00
    priceMykonos: 5000, // €50.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Chicken cutlets",
    description: "Steamed or grilled chicken cutlets",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 4500, // €45.00
    priceMykonos: 5000, // €50.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Chicken nuggets",
    description: "Breaded chicken pieces",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3500, // €35.00
    priceMykonos: 5000, // €50.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Coq au vin",
    description: "French classic - chicken braised with wine",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 6000, // €60.00
    priceMykonos: 6550, // €65.50
    available: true,
    unit: "per portion"
  },
  
  // MEAT
  {
    name: "Veal fillet mignon",
    description: "Veal fillet cooked medium-rare, seasoned with fleur de sel, cut tagliata",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 7900, // €79.00
    priceMykonos: 8000, // €80.00
    available: true,
    unit: "350-400g"
  },
  {
    name: "Veal steak",
    description: "Rib eye veal steak or tenderloin steak grilled and seasoned",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 7900, // €79.00
    priceMykonos: 8000, // €80.00
    available: true,
    unit: "350-400g"
  },
  {
    name: "T-bone steak",
    description: "Grilled medium-rare served with beef gravy",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 7500, // €75.00
    priceMykonos: 8000, // €80.00
    available: true,
    unit: "350-400g"
  },
  {
    name: "Veal osso bucco",
    description: "Braised osso bucco served with fresh gremolata",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 5500, // €55.00
    priceMykonos: 6050, // €60.50
    available: true,
    unit: "350-400g"
  },
  {
    name: "Pork tenderloin",
    description: "Whole pork fillet coated with fresh herbs, grilled with fresh butter",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5300, // €53.00
    priceMykonos: 6050, // €60.50
    available: true,
    unit: "350-400g"
  },
  {
    name: "Pork skewer",
    description: "Tender pork bites, marinated in extra virgin olive oil, fresh Greek herbs and lemon juice",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 3700, // €37.00
    priceMykonos: 6050, // €60.50
    available: true,
    unit: "350-400g"
  },
  {
    name: "Rack of lamb",
    description: "French cut rack of lamb grilled with herbs and fresh butter",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 7200, // €72.00
    priceMykonos: 8000, // €80.00
    available: true,
    unit: "350-400g"
  },
  {
    name: "French cut lamb chops",
    description: "Grilled lamb chops, served with yogurt-cucumber sauce",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 7200, // €72.00
    priceMykonos: 8000, // €80.00
    available: true,
    unit: "350-400g"
  },
  
  // REGIONAL SPECIALTY DISHES
  {
    name: "Kleftiko",
    description: "Roasted lamb with potatoes, onions, garlic, peppers, tomatoes, hard cheese",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5800, // €58.00
    priceMykonos: 7550, // €75.50
    available: true,
    unit: "350-400g"
  },
  {
    name: "Lamb fricassee",
    description: "Lamb stew with wild greens, spinach and egg-lemon sauce",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5800, // €58.00
    priceMykonos: 7550, // €75.50
    available: true,
    unit: "350-400g"
  },
  {
    name: "Beef stifado",
    description: "Beef stew with pearl onions, red wine, tomato sauce",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5800, // €58.00
    priceMykonos: 7550, // €75.50
    available: true,
    unit: "350-400g"
  },
  {
    name: "Moussaka",
    description: "Potatoes, eggplant, minced beef meat, bechamel sauce",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3600, // €36.00
    priceMykonos: 6050, // €60.50
    available: true,
    unit: "350-400g"
  },
  {
    name: "Stuffed zucchini",
    description: "Zucchini with minced beef meat, quinoa, lemon sauce",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3600, // €36.00
    priceMykonos: 6050, // €60.50
    available: true,
    unit: "350-400g"
  },
  {
    name: "Pastitsio",
    description: "Pasta, minced beef meat, cheese, bechamel sauce",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3600, // €36.00
    priceMykonos: 5850, // €58.50
    available: true,
    unit: "350-400g"
  },
  {
    name: "Hunkar begendi",
    description: "Veal meat stew in tomato sauce with eggplant puree",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5800, // €58.00
    priceMykonos: 7850, // €78.50
    available: true,
    unit: "350-400g"
  },
  {
    name: "Gemista",
    description: "Stuffed tomatoes and bell peppers with rice, mint, parsley and raisins",
    category: "main",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 3600, // €36.00
    priceMykonos: 4270, // €42.70
    available: true,
    unit: "350-400g"
  },
  {
    name: "Meatballs",
    description: "Traditional Greek meatballs",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 2800, // €28.00
    priceMykonos: 3570, // €35.70
    available: true,
    unit: "350-400g"
  },
  
  // PASTA
  {
    name: "Spaghetti al pomodoro",
    description: "Tomato sauce, basil",
    category: "main",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 2800, // €28.00
    priceMykonos: 3360, // €33.60
    available: true,
    unit: "350-400g"
  },
  {
    name: "Orecchietti al pesto di basilico",
    description: "Orecchietti pasta with basil pesto",
    category: "main",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 3560, // €35.60
    available: true,
    unit: "350-400g"
  },
  {
    name: "Pappardelle al ragu",
    description: "Pappardelle pasta with ragu sauce",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3400, // €34.00
    priceMykonos: 3830, // €38.30
    available: true,
    unit: "350-400g"
  },
  {
    name: "Meat or vegetable lasagna",
    description: "Classic layered pasta dish",
    category: "main",
    dietaryOptions: ["regular", "vegetarian"],
    priceThessaloniki: 3500, // €35.00
    priceMykonos: 4230, // €42.30
    available: true,
    unit: "350-400g"
  },
  {
    name: "Ravioli filled with ricotta and spinach",
    description: "Stuffed pasta with cheese and spinach filling",
    category: "main",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 3400, // €34.00
    priceMykonos: 4030, // €40.30
    available: true,
    unit: "350-400g"
  },
  {
    name: "Spaghetti aglio e olio",
    description: "Spaghetti with extra virgin olive oil, garlic and parsley",
    category: "main",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 2600, // €26.00
    priceMykonos: 3360, // €33.60
    available: true,
    unit: "350-400g"
  },
  {
    name: "Linguine alle vongole",
    description: "Linguine with clams",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 5750, // €57.50
    priceMykonos: 5560, // €55.60
    available: true,
    unit: "350-400g"
  },
  {
    name: "Spaghetti alla bottarga",
    description: "Spaghetti with bottarga from Messologgi",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 6250, // €62.50
    priceMykonos: 6260, // €62.60
    available: true,
    unit: "350-400g"
  },
  {
    name: "Pasta with seafood",
    description: "Pasta with assorted seafood",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 7200, // €72.00
    priceMykonos: 7200, // €72.00
    available: true,
    unit: "350-400g"
  },
  
  // RISOTTO AND ORZOTTO
  {
    name: "Risotto ala Milanese",
    description: "Risotto with saffron from Kozani",
    category: "main",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 2800, // €28.00
    priceMykonos: 3560, // €35.60
    available: true,
    unit: "per portion"
  },
  {
    name: "Seafood risotto",
    description: "Risotto with assorted seafood",
    category: "main",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 6200, // €62.00
    priceMykonos: 6950, // €69.50
    available: true,
    unit: "per portion"
  },
  {
    name: "Asparagus risotto",
    description: "Risotto with fresh asparagus",
    category: "main",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 3100, // €31.00
    priceMykonos: 4850, // €48.50
    available: true,
    unit: "per portion"
  },
  {
    name: "Mushroom and truffle risotto",
    description: "Risotto with mushrooms and truffle",
    category: "main",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 3600, // €36.00
    priceMykonos: 5250, // €52.50
    available: true,
    unit: "per portion"
  },
  {
    name: "Mussel orzotto",
    description: "Orzo pasta dish with mussels",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 4000, // €40.00
    priceMykonos: 4850, // €48.50
    available: true,
    unit: "per portion"
  },
  {
    name: "Shrimp orzotto",
    description: "Orzo pasta dish with shrimp",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 5600, // €56.00
    priceMykonos: 6090, // €60.90
    available: true,
    unit: "per portion"
  },
  
  // PIZZA
  {
    name: "Neapolitan style pizza dough",
    description: "Traditional Neapolitan pizza base",
    category: "main",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 4500, // €45.00
    available: true,
    unit: "per pizza"
  },
  {
    name: "Pizza Margherita",
    description: "Mozzarella, basil, tomato sauce",
    category: "main",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 4500, // €45.00
    available: true,
    unit: "per pizza"
  },
  {
    name: "Pizza pepperoni",
    description: "Mozzarella, pepperoni, tomato sauce",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3200, // €32.00
    priceMykonos: 4500, // €45.00
    available: true,
    unit: "per pizza"
  },
  {
    name: "Pizza quattro formaggi",
    description: "Mozzarella, gorgonzola, parmigiano reggiano, goat cheese",
    category: "main",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 3500, // €35.00
    priceMykonos: 4500, // €45.00
    available: true,
    unit: "per pizza"
  },
  {
    name: "Pizza al tartufo",
    description: "Mozzarella, parmigiano reggiano, fresh truffle, rosemary",
    category: "main",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 4000, // €40.00
    priceMykonos: 5000, // €50.00
    available: true,
    unit: "per pizza"
  },
  {
    name: "Pizza with prosciutto and arugula",
    description: "Pizza topped with prosciutto and fresh arugula",
    category: "main",
    dietaryOptions: ["regular"],
    priceThessaloniki: 4000, // €40.00
    priceMykonos: 4500, // €45.00
    available: true,
    unit: "per pizza"
  },
  
  // SIDE DISHES
  {
    name: "Roasted baby potatoes",
    description: "Crispy roasted small potatoes",
    category: "side",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 1900, // €19.00
    priceMykonos: 3000, // €30.00
    available: true,
    unit: "300g"
  },
  {
    name: "Basmati rice",
    description: "Steamed basmati rice",
    category: "side",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 1700, // €17.00
    priceMykonos: 3000, // €30.00
    available: true,
    unit: "300g"
  },
  {
    name: "Grilled or steamed vegetables",
    description: "Assorted vegetables prepared to your preference",
    category: "side",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 2200, // €22.00
    priceMykonos: 4000, // €40.00
    available: true,
    unit: "300g"
  },
  {
    name: "Grilled mushrooms",
    description: "Seasoned mushrooms grilled to perfection",
    category: "side",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 2600, // €26.00
    priceMykonos: 3860, // €38.60
    available: true,
    unit: "300g"
  },
  {
    name: "Sautéed spinach",
    description: "Fresh spinach sautéed with olive oil and garlic",
    category: "side",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 2200, // €22.00
    priceMykonos: 3860, // €38.60
    available: true,
    unit: "300g"
  },
  {
    name: "Mashed potatoes",
    description: "Creamy mashed potatoes",
    category: "side",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 1800, // €18.00
    priceMykonos: 3000, // €30.00
    available: true,
    unit: "300g"
  },
  {
    name: "Semolina cous-cous",
    description: "Traditional Middle Eastern grain dish",
    category: "side",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 1700, // €17.00
    priceMykonos: 2860, // €28.60
    available: true,
    unit: "300g"
  },
  {
    name: "Sweet potato puree",
    description: "Smooth pureed sweet potatoes",
    category: "side",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 1900, // €19.00
    priceMykonos: 3000, // €30.00
    available: true,
    unit: "300g"
  },
  
  // SANDWICHES AND BURGERS
  {
    name: "French baguette with prosciutto",
    description: "French baguette with prosciutto, gruyere and arugula",
    category: "sandwich",
    dietaryOptions: ["regular"],
    priceThessaloniki: 2700, // €27.00
    priceMykonos: 2880, // €28.80
    available: true,
    unit: "per sandwich"
  },
  {
    name: "Whole grain baguette with feta",
    description: "Whole grain baguette with feta cheese, Kalamata olives, tomato, sauce tartar, oregano",
    category: "sandwich",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 2200, // €22.00
    priceMykonos: 2680, // €26.80
    available: true,
    unit: "per sandwich"
  },
  {
    name: "Ciabatta with grilled vegetables",
    description: "Ciabatta bread with grilled eggplant, zucchini, mushroom, red pepper with gremolata mayonnaise and fresh arugula",
    category: "sandwich",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 2200, // €22.00
    priceMykonos: 2680, // €26.80
    available: true,
    unit: "per sandwich"
  },
  {
    name: "Sourdough with avocado",
    description: "Sourdough bread with cucumber, avocado, mozzarella, French lettuce, sprouts and green goddess sauce",
    category: "sandwich",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 2400, // €24.00
    priceMykonos: 2680, // €26.80
    available: true,
    unit: "per sandwich"
  },
  {
    name: "Brioche bun with apaki",
    description: "Brioche bun with apaki (smoked pork), confit tomato, galotiri (Greek spreadable sheep cheese) and fresh spinach",
    category: "sandwich",
    dietaryOptions: ["regular"],
    priceThessaloniki: 2300, // €23.00
    priceMykonos: 2680, // €26.80
    available: true,
    unit: "per sandwich"
  },
  {
    name: "Club sandwich with ham",
    description: "Club sandwich with ham, bacon, cheese, tomato, potato chips, lettuce and mayonnaise",
    category: "sandwich",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 3980, // €39.80
    available: true,
    unit: "per sandwich"
  },
  {
    name: "Club sandwich with chicken",
    description: "Club sandwich with grilled chicken breast, bacon, cheese, potato chips, tomato, lettuce and curry mayonnaise",
    category: "sandwich",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 3980, // €39.80
    available: true,
    unit: "per sandwich"
  },
  {
    name: "Tortilla with shredded chicken",
    description: "Tortilla with shredded chicken, iceberg, pico de gallo and guacamole",
    category: "sandwich",
    dietaryOptions: ["regular"],
    priceThessaloniki: 2200, // €22.00
    priceMykonos: 2680, // €26.80
    available: true,
    unit: "per sandwich"
  },
  {
    name: "Ciabatta with roasted beef",
    description: "Ciabatta bread with sliced roasted beef, onion chutney and dijon mustard",
    category: "sandwich",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 4850, // €48.50
    available: true,
    unit: "per sandwich"
  },
  {
    name: "Milk bun with shrimp tempura",
    description: "Milk bun with shrimp tempura, sweet chili mayonnaise and cucumber spaghetti",
    category: "sandwich",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 3000, // €30.00
    available: true,
    unit: "per sandwich"
  },
  {
    name: "All American burger",
    description: "Beef patty, bacon, cheddar cheese, sunny side up egg and bbq sauce",
    category: "sandwich",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 3550, // €35.50
    available: true,
    unit: "per burger"
  },
  {
    name: "Fried buttermilk chicken burger",
    description: "With carrot and cucumber salad, sweet chili mayonnaise and iceberg",
    category: "sandwich",
    dietaryOptions: ["regular"],
    priceThessaloniki: 2450, // €24.50
    priceMykonos: 3280, // €32.80
    available: true,
    unit: "per burger"
  },
  {
    name: "Lamb burger",
    description: "With goat cheese, arugula and truffle mayonnaise",
    category: "sandwich",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3750, // €37.50
    priceMykonos: 4850, // €48.50
    available: true,
    unit: "per burger"
  },
  {
    name: "Mushroom and haloumi burger",
    description: "With spinach and tomato chutney",
    category: "sandwich",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 2450, // €24.50
    priceMykonos: 2880, // €28.80
    available: true,
    unit: "per burger"
  },
  {
    name: "Pitta gyros with tzatziki",
    description: "Traditional Greek gyros in pita bread with tzatziki sauce",
    category: "sandwich",
    dietaryOptions: ["regular"],
    priceThessaloniki: 1800, // €18.00
    priceMykonos: 2200, // €22.00
    available: true,
    unit: "per gyros"
  },
  
  // PLATTERS
  {
    name: "Cold meat cuts",
    description: "Cuts of smoked turkey, mortadella, pastrami, smoked chicken breast, salami",
    category: "platter",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3900, // €39.00
    priceMykonos: 5050, // €50.50
    available: true,
    unit: "250-300g"
  },
  {
    name: "Premium cold meat cuts",
    description: "Prosciutto, bresaola, truffle smoked turkey, pastrami, traditional Greek pork cuts such as apaki, loutza",
    category: "platter",
    dietaryOptions: ["regular"],
    priceThessaloniki: 4400, // €44.00
    priceMykonos: 6050, // €60.50
    available: true,
    unit: "250-300g"
  },
  {
    name: "Cheese platter",
    description: "Feta cheese, gruyere, blue cheese, smoked cheese from Metsovo, Greek yellow cheese, manouri",
    category: "platter",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 3900, // €39.00
    priceMykonos: 5050, // €50.50
    available: true,
    unit: "250-300g"
  },
  {
    name: "Premium cheese platter",
    description: "San Michali, cheese matured in wine, parmigiano reggiano, manouri from Vlasti, gruyere with truffle and thyme",
    category: "platter",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 4400, // €44.00
    priceMykonos: 6050, // €60.50
    available: true,
    unit: "250-300g"
  },
  {
    name: "Cold fish cuts",
    description: "Cuts of smoked fish salmon, tuna, anchovy, mackerel and a variety of marinated fish",
    category: "platter",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 4000, // €40.00
    priceMykonos: 5850, // €58.50
    available: true,
    unit: "250-300g"
  },
  {
    name: "Premium cold fish cuts",
    description: "Trout, smoked mackerel, Scottish salmon, fresh tuna pastrami, smoked eel and a large variety of marinated fish",
    category: "platter",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 4700, // €47.00
    priceMykonos: 6050, // €60.50
    available: true,
    unit: "250-300g"
  },
  {
    name: "Seafood platter",
    description: "Octopus, squid, shrimps, scampi",
    category: "platter",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 5500, // €55.00
    priceMykonos: 6750, // €67.50
    available: true,
    unit: "per platter"
  },
  {
    name: "Premium seafood platter",
    description: "Lobster, crab, octopus, squid, king prawns",
    category: "platter",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 8500, // €85.00
    priceMykonos: 9850, // €98.50
    available: true,
    unit: "per platter"
  },
  {
    name: "Smoked salmon platter",
    description: "Scottish salmon, cucumber pickle, cheese cream, ikura",
    category: "platter",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 4500, // €45.00
    priceMykonos: 6250, // €62.50
    available: true,
    unit: "per platter"
  },
  {
    name: "Crudité",
    description: "Fresh vegetable platter with a variety of dips",
    category: "platter",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 3900, // €39.00
    priceMykonos: 5570, // €55.70
    available: true,
    unit: "per platter"
  },
  {
    name: "Greek meze platter",
    description: "Antipasti, olives, dolmades, sausages, meatballs, grilled haloumi, cheese",
    category: "platter",
    dietaryOptions: ["regular"],
    priceThessaloniki: 3550, // €35.50
    priceMykonos: 5000, // €50.00
    available: true,
    unit: "per platter"
  },
  {
    name: "Canape platter",
    description: "A variety of canapés",
    category: "platter",
    dietaryOptions: ["regular"],
    priceThessaloniki: 600, // €6.00
    priceMykonos: 1000, // €10.00
    available: true,
    unit: "per piece"
  },
  {
    name: "Finger food platter",
    description: "A variety of finger food",
    category: "platter",
    dietaryOptions: ["regular"],
    priceThessaloniki: 600, // €6.00
    priceMykonos: 1200, // €12.00
    available: true,
    unit: "per piece"
  },
  {
    name: "Mini sandwich platter",
    description: "A variety of mini sandwiches",
    category: "platter",
    dietaryOptions: ["regular"],
    priceThessaloniki: 650, // €6.50
    priceMykonos: 1200, // €12.00
    available: true,
    unit: "per piece"
  },
  {
    name: "Premium mini sandwich platter",
    description: "A variety of premium mini sandwiches",
    category: "platter",
    dietaryOptions: ["regular"],
    priceThessaloniki: 750, // €7.50
    priceMykonos: 1350, // €13.50
    available: true,
    unit: "per piece"
  },
  {
    name: "Finger sandwich platter",
    description: "A variety of finger sandwiches",
    category: "platter",
    dietaryOptions: ["regular"],
    priceThessaloniki: 700, // €7.00
    priceMykonos: 1200, // €12.00
    available: true,
    unit: "per piece"
  },
  
  // SOUPS
  {
    name: "Chicken soup",
    description: "Chicken, noodles, egg-lemon sauce",
    category: "soup",
    dietaryOptions: ["regular"],
    priceThessaloniki: 2500, // €25.00
    priceMykonos: 3780, // €37.80
    available: true,
    unit: "per bowl"
  },
  {
    name: "Fish soup",
    description: "Seasonal fish, potatoes, celeriac, carrots, egg-lemon sauce",
    category: "soup",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 4580, // €45.80
    available: true,
    unit: "per bowl"
  },
  {
    name: "Minestrone",
    description: "Italian vegetable soup",
    category: "soup",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 2300, // €23.00
    priceMykonos: 3680, // €36.80
    available: true,
    unit: "per bowl"
  },
  {
    name: "Broccoli veloute",
    description: "Creamy broccoli soup",
    category: "soup",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 2500, // €25.00
    priceMykonos: 4280, // €42.80
    available: true,
    unit: "per bowl"
  },
  {
    name: "Seasonal vegetables veloute",
    description: "Creamy soup with seasonal vegetables",
    category: "soup",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 2500, // €25.00
    priceMykonos: 3680, // €36.80
    available: true,
    unit: "per bowl"
  },
  {
    name: "Mushroom soup",
    description: "Creamy mushroom soup",
    category: "soup",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 2800, // €28.00
    priceMykonos: 4280, // €42.80
    available: true,
    unit: "per bowl"
  },
  {
    name: "Beef soup",
    description: "Beef, carrots, potatoes, tomato, onion, celeriac, celery, lemon juice",
    category: "soup",
    dietaryOptions: ["regular", "gluten-free"],
    priceThessaloniki: 3500, // €35.00
    priceMykonos: 4580, // €45.80
    available: true,
    unit: "per bowl"
  },
  
  // DESSERTS
  {
    name: "Chocolate pie",
    description: "Rich chocolate dessert",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per slice"
  },
  {
    name: "Lemon pie",
    description: "Tangy lemon dessert",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per slice"
  },
  {
    name: "Orange pie",
    description: "Citrusy orange dessert",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per slice"
  },
  {
    name: "Tiramisu",
    description: "Italian coffee-flavored dessert",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Panna cotta",
    description: "Italian cream dessert",
    category: "dessert",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Cheesecake",
    description: "Creamy cheese-based dessert",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per slice"
  },
  {
    name: "Millefeuille",
    description: "French layered pastry with cream",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Profiterole",
    description: "Cream puffs with chocolate sauce",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Chocolate mousse",
    description: "Light, airy chocolate dessert",
    category: "dessert",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Fruit tartlets",
    description: "Pastry shells filled with custard and topped with fruit",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per tartlet"
  },
  {
    name: "Loukoumades",
    description: "Greek honey dumplings",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1200, // €12.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Greek halva",
    description: "Semolina dessert with syrup",
    category: "dessert",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per portion"
  },
  {
    name: "Baklava",
    description: "Layered phyllo pastry with nuts and honey",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per piece"
  },
  {
    name: "Triangle pastry filled with cream",
    description: "Traditional Greek triangular pastry with custard filling",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 1400, // €14.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "per piece"
  },
  {
    name: "Traditional Greek fruit spoon sweets",
    description: "Preserved fruits in syrup",
    category: "dessert",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 900, // €9.00
    priceMykonos: 1450, // €14.50
    available: true,
    unit: "per portion"
  },
  {
    name: "Assorted traditional Greek mini pastries",
    description: "Selection of small Greek pastries",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 500, // €5.00
    priceMykonos: 950, // €9.50
    available: true,
    unit: "per piece"
  },
  {
    name: "Assorted mini desserts",
    description: "Selection of small desserts",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 500, // €5.00
    priceMykonos: 1020, // €10.20
    available: true,
    unit: "per piece"
  },
  {
    name: "Assorted petit four",
    description: "Small bite-sized confectioneries",
    category: "dessert",
    dietaryOptions: ["vegetarian"],
    priceThessaloniki: 300, // €3.00
    priceMykonos: 900, // €9.00
    available: true,
    unit: "per piece"
  },
  {
    name: "Ice cream and sorbets",
    description: "Various flavors of frozen desserts",
    category: "dessert",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 1100, // €11.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "100g"
  },
  {
    name: "Ice cream Haagen Dazs (small)",
    description: "Premium ice cream",
    category: "dessert",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 1000, // €10.00
    priceMykonos: 2700, // €27.00
    available: true,
    unit: "80g"
  },
  {
    name: "Ice cream Haagen Dazs (large)",
    description: "Premium ice cream",
    category: "dessert",
    dietaryOptions: ["vegetarian", "gluten-free"],
    priceThessaloniki: 2700, // €27.00
    priceMykonos: 4000, // €40.00
    available: true,
    unit: "400g"
  },
  
  // BEVERAGES
  {
    name: "Orange juice (1ltr)",
    description: "Freshly squeezed orange juice",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 3850, // €38.50
    available: true,
    unit: "1 liter"
  },
  {
    name: "Orange juice (0.5ltr)",
    description: "Freshly squeezed orange juice",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 1500, // €15.00
    priceMykonos: 2000, // €20.00
    available: true,
    unit: "0.5 liter"
  },
  {
    name: "Lemon juice (1ltr)",
    description: "Freshly squeezed lemon juice",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 3850, // €38.50
    available: true,
    unit: "1 liter"
  },
  {
    name: "Lemon juice (0.5ltr)",
    description: "Freshly squeezed lemon juice",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 1500, // €15.00
    priceMykonos: 2000, // €20.00
    available: true,
    unit: "0.5 liter"
  },
  {
    name: "Pomegranate juice (1ltr)",
    description: "Freshly squeezed pomegranate juice",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 3200, // €32.00
    priceMykonos: 4050, // €40.50
    available: true,
    unit: "1 liter"
  },
  {
    name: "Pomegranate juice (0.5ltr)",
    description: "Freshly squeezed pomegranate juice",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 1600, // €16.00
    priceMykonos: 2100, // €21.00
    available: true,
    unit: "0.5 liter"
  },
  {
    name: "Mineral water (1.5ltr)",
    description: "Still bottled water",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 450, // €4.50
    priceMykonos: 950, // €9.50
    available: true,
    unit: "1.5 liter"
  },
  {
    name: "Mineral water (0.5ltr)",
    description: "Still bottled water",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 350, // €3.50
    priceMykonos: 550, // €5.50
    available: true,
    unit: "0.5 liter"
  },
  {
    name: "Sparkling water (1.5ltr)",
    description: "Carbonated bottled water",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 500, // €5.00
    priceMykonos: 1100, // €11.00
    available: true,
    unit: "1.5 liter"
  },
  {
    name: "Sparkling water (330ml)",
    description: "Carbonated bottled water",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 400, // €4.00
    priceMykonos: 650, // €6.50
    available: true,
    unit: "330ml"
  },
  {
    name: "Soft drinks",
    description: "Various carbonated beverages",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 500, // €5.00
    priceMykonos: 650, // €6.50
    available: true,
    unit: "330ml"
  },
  {
    name: "Tea",
    description: "Hot brewed tea",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 2000, // €20.00
    priceMykonos: 2380, // €23.80
    available: true,
    unit: "1 liter"
  },
  {
    name: "Coffee",
    description: "Freshly brewed coffee",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 3000, // €30.00
    priceMykonos: 3650, // €36.50
    available: true,
    unit: "1 liter"
  },
  {
    name: "Hot water",
    description: "Hot water for tea or other beverages",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 500, // €5.00
    priceMykonos: 900, // €9.00
    available: true,
    unit: "1 liter"
  },
  {
    name: "Evian (330ml)",
    description: "Premium French mineral water",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 650, // €6.50
    priceMykonos: 650, // €6.50
    available: true,
    unit: "330ml"
  },
  {
    name: "Evian (0.5ltr)",
    description: "Premium French mineral water",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 750, // €7.50
    priceMykonos: 950, // €9.50
    available: true,
    unit: "0.5 liter"
  },
  {
    name: "Evian (1ltr)",
    description: "Premium French mineral water",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 900, // €9.00
    priceMykonos: 1250, // €12.50
    available: true,
    unit: "1 liter"
  },
  {
    name: "San Pellegrino (1ltr)",
    description: "Premium Italian sparkling water",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 900, // €9.00
    priceMykonos: 900, // €9.00
    available: true,
    unit: "1 liter"
  },
  {
    name: "Ice cubes",
    description: "Frozen water cubes for beverages",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan", "gluten-free"],
    priceThessaloniki: 400, // €4.00
    priceMykonos: 770, // €7.70
    available: true,
    unit: "1kg"
  },
  {
    name: "Beers",
    description: "Various brands of beer",
    category: "beverage",
    dietaryOptions: ["vegetarian", "vegan"],
    priceThessaloniki: 700, // €7.00
    priceMykonos: 800, // €8.00
    available: true,
    unit: "per bottle"
  }
];
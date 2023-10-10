const apiKey = '57723743743e4068a41718c25cf89baf';

function calculateCalorieRequirement(event) {
  event.preventDefault();

  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);
  const age = parseFloat(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const activity = document.getElementById('activity').value;

  let bmr = 0;
  let calorieRequirement = 0;

  if (gender === 'male') {
    bmr = 66.47 + 13.75 * weight + 5.003 * height - 6.755 * age;
  } else if (gender === 'female') {
    bmr = 655.1 + 9.563 * weight + 1.85 * height - 4.676 * age;
  }

  switch (activity) {
    case 'light':
      calorieRequirement = bmr * 1.375;
      break;
    case 'moderate':
      calorieRequirement = bmr * 1.55;
      break;
    case 'active':
      calorieRequirement = bmr * 1.725;
      break;
    default:
      calorieRequirement = bmr;
  }

  generateMealPlan(calorieRequirement);
}
async function generateMealPlan(calorieRequirement) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&targetCalories=${calorieRequirement}`
    );
    const data = await response.json();

    const breakfast = data.meals[0];
    const lunch = data.meals[1];
    const dinner = data.meals[2];

    const breakfastRecipe = await fetchRecipeDetails(breakfast.id);
    const lunchRecipe = await fetchRecipeDetails(lunch.id);
    const dinnerRecipe = await fetchRecipeDetails(dinner.id);

    populateMealCard('breakfast-card', breakfast, breakfastRecipe);
    populateMealCard('lunch-card', lunch, lunchRecipe);
    populateMealCard('dinner-card', dinner, dinnerRecipe);

    document.getElementById('meal-plan').style.display = 'block';
  } catch (error) {
    console.log('Error fetching meal plan:', error);
  }
}
function populateMealCard(cardId, meal, recipe) {
  const card = document.getElementById(cardId);
  card.innerHTML = `
    <img src="${meal.image}" alt="${meal.title}">
    <h3>${meal.title}</h3>
    <p>Calories: ${recipe ? recipe.calories : 'N/A'}</p>
    <button onclick="getRecipe(${meal.id})">Get Recipe</button>
  `;
}
async function fetchRecipeDetails(mealId) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${mealId}/nutritionWidget.json?apiKey=${apiKey}`
    );
    const data = await response.json();
    return {
      calories: data.calories
    };
  } catch (error) {
    console.log('Error fetching recipe details:', error);
    return null;
  }
}
async function getRecipe(mealId) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${mealId}/information?apiKey=${apiKey}`
    );
    const data = await response.json();

    populateRecipeDetails(data);
  } catch (error) {
    console.log('Error fetching recipe details:', error);
  }
}

// Function to populate the recipe details in the recipe section
function populateRecipeDetails(recipe) {
  const recipeSection = document.getElementById('recipe-section');
  recipeSection.innerHTML = `
    <h2>${recipe.title}</h2>
    <img src="${recipe.image}" alt="${recipe.title}">
    <h3>Ingredients:</h3>
    <ul>${recipe.extendedIngredients
      .map((item) => `<li>${item.original}</li>`)
      .join('')}</ul>
    <h3>Instructions:</h3>
    <ol>${recipe.analyzedInstructions[0].steps
      .map((step) => `<li>${step.step}</li>`)
      .join('')}</ol>
    <h3>Equipment:</h3>
    <ul>${recipe.analyzedInstructions[0].steps
      .flatMap((step) => step.equipment)
      .map((item) => `<li>${item.name}</li>`)
      .join('')}</ul>
  `;
  recipeSection.style.display = 'block';
}

document.getElementById('user-form').addEventListener('submit', calculateCalorieRequirement);
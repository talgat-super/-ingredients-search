const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');

// слушатели событий
searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});

const searchInput = document.getElementById('search-input');
searchInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    getMealList();
  }
});

function getMealList(){
    let searchInputTxt = searchInput.value.trim();
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`)
    .then(response => response.json())
    .then(data => {
        let html = "";
        if(data.meals){
            data.meals.forEach(meal => {
                html += `
                    <div class = "meal-item" data-id = "${meal.idMeal}">
                        <div class = "meal-img">
                            <img src = "${meal.strMealThumb}" alt = "food">
                        </div>
                        <<div class = "meal-name">
                            <h3>${meal.strMeal}</h3>
                            <<a href = "#" class = "recipe-btn">Get Recipe</a>
                        </div>
                    </div>
                `;
            });
            mealList.classList.remove('notFound');
            
            // fetch a recommendation for a random meal from the same category
            const category = data.meals[0].strCategory;
            fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
            .then(response => response.json())
            .then(data => {
                const randomMeal = data.meals[Math.floor(Math.random() * data.meals.length)];
                const recommendation = `
                    <div class="recommendation">
                        <h4>Recommended Dish:</h4>
                        <p>${randomMeal.strMeal}</p>
                        <img src="${randomMeal.strMealThumb}" alt="food">
                    </div>
                `;
                mealList.insertAdjacentHTML('beforebegin', recommendation);
            });
        } else{
            html = "Sorry, we didn't find any meal!";
            mealList.classList.add('notFound');
        }

        mealList.innerHTML = html;
    });
}

//получите список блюд, соответствующий ингредиентам
function getMealList(){
    let searchInputTxt = searchInput.value.trim();
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`)
    .then(response => response.json())
    .then(mealData => {
        fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`)
        .then(response => response.json())
        .then(drinkData => {
            let html = "";
            if(mealData.meals || drinkData.drinks){
                if (mealData.meals) {
                    mealData.meals.forEach(meal => {
                        html += `
                            <div class = "meal-item" data-id = "${meal.idMeal}">
                                <div class = "meal-img">
                                    <img src = "${meal.strMealThumb}" alt = "food">
                                </div>
                                <div class = "meal-name">
                                    <h3>${meal.strMeal}</h3>
                                    <a href = "#" class = "recipe-btn">Get Recipe</a>
                                </div>
                            </div>
                        `;
                    });
                }
                if (drinkData.drinks) {
                    drinkData.drinks.forEach(drink => {
                        html += `
                            <div class = "meal-item" data-id = "${drink.idDrink}">
                                <div class = "meal-img">
                                    <img src = "${drink.strDrinkThumb}" alt = "drink">
                                </div>
                                <div class = "meal-name">
                                    <h3>${drink.strDrink}</h3>
                                    <a href = "#" class = "recipe-btn">Get Recipe</a>
                                </div>
                            </div>
                        `;
                    });
                }
                mealList.classList.remove('notFound');
                
                // fetch a recommendation for a random meal or drink from the same category
                const category = mealData.meals ? mealData.meals[0].strCategory : drinkData.drinks[0].strCategory;
                fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
                .then(response => response.json())
                .then(data => {
                    const items = mealData.meals ? data.meals : data.drinks;
                    const randomItem = items[Math.floor(Math.random() * items.length)];
                    const recommendation = `
                        <div class="recommendation">
                            <h4>Recommended Dish or Drink:</h4>
                            <p>${randomItem.strMeal || randomItem.strDrink}</p>
                            <img src="${randomItem.strMealThumb || randomItem.strDrinkThumb}" alt="food or drink">
                        </div>
                    `;
                    mealList.insertAdjacentHTML('beforebegin', recommendation);
                });
            } else{
                html = "Sorry, we didn't find any meals or drinks!";
                mealList.classList.add('notFound');
            }

            mealList.innerHTML = html;
        });
    });
}

// получите рецепт приготовления блюда
function getMealRecipe(e){
    e.preventDefault();
    if(e.target.classList.contains('recipe-btn')){
        let mealItem = e.target.parentElement.parentElement;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
        .then(response => response.json())
        .then(data => mealRecipeModal(data.meals));
    }
}

// 
function mealRecipeModal(meal){
    console.log(meal);
    meal = meal[0];
    let html = `
        <h2 class = "recipe-title">${meal.strMeal}</h2>
        <p class = "recipe-category">${meal.strCategory}</p>
        <div class = "recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class = "recipe-meal-img">
            <img src = "${meal.strMealThumb}" alt = "">
        </div>
        <div class = "recipe-link">
            <a href = "${meal.strYoutube}" target = "_blank">Watch Video</a>
        </div>
    `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add('showRecipe');
}
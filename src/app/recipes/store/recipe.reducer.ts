import {Action, createReducer, on } from '@ngrx/store';
import * as RecipeAction from './recipe.action';
import { Recipe } from '../recipe.model';

export interface State { recipes: Recipe[] }
const initialState: State = { recipes: [] };

export function RecipeReducer(recipeState: State | undefined, recipeAction: Action) {
  return createReducer(
    initialState,
    on(RecipeAction.addRecipe, (state, action) => ({...state, recipes: state.recipes.concat({...action.recipe})})),
    on(RecipeAction.updateRecipe, (state, action) =>
    ({...state, recipes: state.recipes.map((recipe, index) => index === action.index? {...action.recipe} : recipe)})),
    on(RecipeAction.deleteRecipe, (state, action) =>
    ({...state, recipes: state.recipes.filter((recipe, index) => action.index !== index)})),
    on(RecipeAction.setRecipes, (state, action) => ({...state, recipes: [...action.recipes]}))
  )(recipeState, recipeAction);
}

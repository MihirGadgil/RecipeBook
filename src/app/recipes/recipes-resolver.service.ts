import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { take, map, switchMap } from 'rxjs/operators';
import { Recipe } from './recipe.model';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as RecipeActions from './store/recipe.action';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecipesResolverService implements Resolve<Recipe[]> {
  constructor(
    private store: Store<fromApp.AppState>,
    private actions$: Actions
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // const recipes = this.recipesService.getRecipes();
    return this.store.select('recipes').pipe(
      take(1),
      map(recipeState => recipeState.recipes),
      switchMap(recipes => {
        if (recipes.length === 0) {
          this.store.dispatch(RecipeActions.fetchRecipes());
          return this.actions$.pipe(
              ofType(RecipeActions.setRecipes),
              take(1),
              map(recipeState => recipeState.recipes)
          );
        } else {
          return of(recipes);
        }
      })
    );
  }
}

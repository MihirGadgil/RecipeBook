import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as RecipeActions from './recipe.action';
import { HttpClient } from '@angular/common/http';
import { Recipe } from '../recipe.model';
import { switchMap, map, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';

@Injectable()
export class RecipeEffects {

  constructor(private actions$: Actions, private http: HttpClient, private store: Store<fromApp.AppState>) {}
  static readonly url = 'https://ng-recipe-book-mg.firebaseio.com/';

  fetchRecipes$ = createEffect(() =>
    this.actions$.pipe(
        ofType(RecipeActions.fetchRecipes),
        switchMap(() => {
          return this.http.get<Recipe[]>(RecipeEffects.url + 'recipes.json');
        }),
        map(recipes => {
          return recipes.map(recipe => {
            return {
              ...recipe,
              ingredients: recipe.ingredients? recipe.ingredients: []
            }
          })
        }),
        map((recipes) => {
          return RecipeActions.setRecipes({recipes});
        })
      )
    );

    storeRecipes$ = createEffect(() =>
        this.actions$.pipe(
          ofType(RecipeActions.storeRecipes),
          withLatestFrom(this.store.select('recipes')),
          switchMap(([actionData, recipeState]) => {
            return this.http.put(RecipeEffects.url + 'recipes.json', recipeState.recipes);
          })
        ),
    {dispatch: false}
    );
}

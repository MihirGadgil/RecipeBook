import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Recipe } from '../recipe.model';
import { Store } from '@ngrx/store';
import * as RecipeActions from '../store/recipe.action';
import * as fromApp from '../../store/app.reducer';
import * as ShoppingListActions from '../../shopping-list/store/shopping-list.actions';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private store: Store<fromApp.AppState>) {
  }

  ngOnInit() {
    this.route.params.pipe(
      map(params => {return +params.id}),
      switchMap(id => {
        this.id = id;
        return this.store.select('recipes');
      }),
      map(recipeState => {
        return recipeState.recipes.find((recipe, index) => {
          return index === this.id;
        })
      })
    )
    .subscribe(recipe => {
      this.recipe = recipe;
    });
  }

  onAddToShoppingList() {
    // this.recipeService.addIngredientsToShoppingList(this.recipe.ingredients);
    this.store.dispatch(ShoppingListActions.addIngredients({ingredients: this.recipe.ingredients}))
  }

  onEditRecipe() {
    this.router.navigate(['edit'], {relativeTo: this.route});
    // this.router.navigate(['../', this.id, 'edit'], {relativeTo: this.route});
  }

  onDeleteRecipe() {
    this.store.dispatch(RecipeActions.deleteRecipe({index: this.id}))
    // this.recipeService.deleteRecipe(this.id);
    this.router.navigate(['/recipes']);
  }

}

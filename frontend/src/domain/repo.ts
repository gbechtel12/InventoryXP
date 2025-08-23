import { inject, provide, type InjectionKey } from 'vue'
import type { Repo } from './types'

// Symbol for dependency injection
export const RepoSymbol: InjectionKey<Repo> = Symbol('Repo')

// Provide function for setting up the repository
export function provideRepo(repo: Repo) {
  provide(RepoSymbol, repo)
}

// Composable for consuming the repository
export function useRepo(): Repo {
  const repo = inject(RepoSymbol)
  if (!repo) {
    throw new Error('Repository not provided. Make sure to call provideRepo() in your app setup.')
  }
  return repo
}

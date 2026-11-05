import { PROVIDERS, ENVIRONMENTS } from "../config/destinations";

export interface FilterState {
  search: string;
  provider: string; // "" = all
  environment: string; // "" = all
  access: string; // "" = all | read | full
}

export const EMPTY_FILTERS: FilterState = {
  search: "",
  provider: "",
  environment: "",
  access: "",
};

export function Filters({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const set = (patch: Partial<FilterState>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="filters" role="search">
      <div className="field search">
        <label htmlFor="f-search">Search</label>
        <input
          id="f-search"
          className="input search"
          type="search"
          placeholder="Search destinations…"
          value={value.search}
          onChange={(e) => set({ search: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="f-provider">Provider</label>
        <select
          id="f-provider"
          className="select"
          value={value.provider}
          onChange={(e) => set({ provider: e.target.value })}
        >
          <option value="">All providers</option>
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-env">Environment</label>
        <select
          id="f-env"
          className="select"
          value={value.environment}
          onChange={(e) => set({ environment: e.target.value })}
        >
          <option value="">All environments</option>
          {ENVIRONMENTS.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-access">Access</label>
        <select
          id="f-access"
          className="select"
          value={value.access}
          onChange={(e) => set({ access: e.target.value })}
        >
          <option value="">Any access</option>
          <option value="read">Read-only</option>
          <option value="full">Full access</option>
        </select>
      </div>

      <button
        className="btn btn-sm filter-reset"
        onClick={() => onChange(EMPTY_FILTERS)}
      >
        Reset
      </button>
    </div>
  );
}

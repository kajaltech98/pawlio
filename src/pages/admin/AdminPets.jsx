import { useEffect, useState } from "react";
import {
  PawPrint,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Calendar,
  User,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAdminPets } from "../../lib/adminService";

export default function AdminPets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");

  const loadPets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminPets();
      setPets(data);
    } catch (err) {
      console.error("Failed to load pets:", err);
      setError("Unable to load pet records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // Get distinct species list
  const availableSpecies = Array.from(
    new Set(pets.map((p) => p.species).filter(Boolean))
  );

  // Filtered pets by search (pet name, breed, owner) and species
  const filteredPets = pets.filter((pet) => {
    // 1. Species filter
    if (speciesFilter !== "all") {
      if ((pet.species || "").toLowerCase() !== speciesFilter.toLowerCase()) {
        return false;
      }
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const nameMatch = (pet.name || "").toLowerCase().includes(query);
      const breedMatch = (pet.breed || "").toLowerCase().includes(query);
      const ownerMatch = (pet.owner_name || "").toLowerCase().includes(query);
      return nameMatch || breedMatch || ownerMatch;
    }

    return true;
  });

  return (
    <AdminLayout title="Pet Directory">
      {/* Page Header Bar */}
      <div className="admin-page-bar">
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0 }}>
            Registered Pets Directory
          </h2>
          <p className="admin-subtitle">
            Comprehensive overview of all animals registered across the PAWLIO ecosystem.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={loadPets}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "animate-spin-slow" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Controls: Search and Species Filter */}
      <div className="admin-controls-bar">
        <div className="admin-search-wrapper">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by pet name, breed, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--admin-text-muted)" }}>
            Species:
          </span>
          <button
            type="button"
            className={`admin-filter-btn ${speciesFilter === "all" ? "active" : ""}`}
            onClick={() => setSpeciesFilter("all")}
          >
            All ({pets.length})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${speciesFilter === "dog" ? "active" : ""}`}
            onClick={() => setSpeciesFilter("dog")}
          >
            Dogs ({pets.filter((p) => (p.species || "").toLowerCase() === "dog").length})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${speciesFilter === "cat" ? "active" : ""}`}
            onClick={() => setSpeciesFilter("cat")}
          >
            Cats ({pets.filter((p) => (p.species || "").toLowerCase() === "cat").length})
          </button>
          {availableSpecies
            .filter((s) => !["dog", "cat"].includes(s.toLowerCase()))
            .map((sp) => (
              <button
                key={sp}
                type="button"
                className={`admin-filter-btn ${
                  speciesFilter.toLowerCase() === sp.toLowerCase() ? "active" : ""
                }`}
                onClick={() => setSpeciesFilter(sp)}
              >
                {sp} (
                {pets.filter((p) => (p.species || "").toLowerCase() === sp.toLowerCase()).length})
              </button>
            ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-loading-container">
            <div className="admin-spinner" />
            <p style={{ fontWeight: 600 }}>Loading pets...</p>
          </div>
        ) : error ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon" style={{ color: "#dc2626", background: "#fee2e2" }}>
              <AlertCircle size={28} />
            </div>
            <h3 className="admin-empty-title">Error Loading Pets</h3>
            <p className="admin-empty-desc">{error}</p>
            <button
              type="button"
              className="admin-btn-primary"
              style={{ marginTop: 14 }}
              onClick={loadPets}
            >
              Retry
            </button>
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <PawPrint size={28} />
            </div>
            <h3 className="admin-empty-title">No Pets Found</h3>
            <p className="admin-empty-desc">
              {searchQuery
                ? "No registered pets match your search criteria."
                : "No pets have been registered yet."}
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pet Name</th>
                  <th>Species & Breed</th>
                  <th>Owner</th>
                  <th>Age & Gender</th>
                  <th>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {filteredPets.map((pet) => (
                  <tr key={pet.id}>
                    {/* Pet Name & Avatar */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "10px",
                            background: "rgba(30, 112, 74, 0.12)",
                            color: "var(--admin-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {pet.image_url ? (
                            <img
                              src={pet.image_url}
                              alt={pet.name}
                              style={{ width: "100%", height: "100%", borderRadius: "10px", objectFit: "cover" }}
                            />
                          ) : (
                            <PawPrint size={18} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--admin-text-main)" }}>
                            {pet.name}
                          </div>
                          {pet.weight && (
                            <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                              {pet.weight} kg
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Species & Breed */}
                    <td>
                      <div style={{ fontWeight: 600 }}>{pet.species || "Unknown"}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>
                        {pet.breed || "Standard Breed"}
                      </div>
                    </td>

                    {/* Owner */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                        <User size={14} color="var(--admin-text-muted)" />
                        <span>{pet.owner_name || "Pet Parent"}</span>
                      </div>
                    </td>

                    {/* Age & Gender */}
                    <td>
                      <div style={{ fontSize: "0.85rem" }}>
                        {pet.gender ? pet.gender : "—"}
                        {pet.age ? ` · ${pet.age} ${pet.age === 1 ? "yr" : "yrs"}` : ""}
                      </div>
                    </td>

                    {/* Date Added */}
                    <td style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem" }}>
                      {formatDate(pet.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

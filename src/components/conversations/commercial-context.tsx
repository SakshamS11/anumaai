import { resolveProductMention } from "@/modules/catalogue/product-catalogue";

export function CommercialContext({
  observations,
  catalogue,
}: {
  observations: Array<{
    type: string;
    text: string | null;
    amountMinor: number | null;
    currencyCode: string | null;
  }>;
  catalogue: Array<{
    id: string;
    name: string;
    aliases: string[];
    brand: string | null;
    model: string | null;
    externalSku: string;
  }>;
}) {
  const productClaims = observations.filter((item) => item.type === "product" && item.text);
  const prices = observations.filter((item) =>
    ["price", "store_quote", "competitor_price"].includes(item.type),
  );
  const competitors = observations.filter((item) => item.type === "competitor");
  if (!productClaims.length && !prices.length && !competitors.length) return null;
  return (
    <section className="understanding-section" aria-labelledby="commercial-context-title">
      <h2 id="commercial-context-title">Commercial context</h2>
      <p>
        Spoken claims are kept separate from the organization’s authoritative product catalogue.
      </p>
      {productClaims.length ? (
        <ul className="observation-list">
          {productClaims.map((claim, index) => {
            const match = resolveProductMention(claim.text!, catalogue);
            return (
              <li key={`${claim.text}-${index}`}>
                <strong>Product mentioned</strong>
                <span>{claim.text}</span>
                <small>
                  {match.state === "confirmed"
                    ? `Catalogue match · ${match.item!.name} (${match.item!.externalSku})`
                    : match.state === "ambiguous"
                      ? "Catalogue match · ambiguous"
                      : "Catalogue match · unresolved"}
                </small>
              </li>
            );
          })}
        </ul>
      ) : null}
      {competitors.length || prices.length ? (
        <ul className="observation-list">
          {competitors.map((item, index) => (
            <li key={`competitor-${index}`}>
              <strong>Competitor claim</strong>
              <span>{item.text}</span>
            </li>
          ))}
          {prices.map((item, index) => (
            <li key={`price-${index}`}>
              <strong>{item.type.replaceAll("_", " ")}</strong>
              <span>
                {item.text ??
                  (item.amountMinor !== null
                    ? `${item.currencyCode ?? ""} ${item.amountMinor}`
                    : "Observed")}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

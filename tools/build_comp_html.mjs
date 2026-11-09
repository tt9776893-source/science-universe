export function generateCompHtml() {
  return `<section aria-hidden="true" aria-label="Компьютерын шинжлэх ухаан" id="computerOverlay">
  <div class="c-shell">
    <!-- Top Header Bar -->
    <header class="c-header">
      <div class="c-header-text">
        <div class="c-tag">
          <span class="c-tag-dot"></span>
          <span>SCIENCE UNIVERSE // COMPUTER SCIENCE</span>
        </div>
        <h1 class="c-headtitle">COMPUTER LAB</h1>
        <p class="c-subtitle">Компьютерын ухаан, алгоритм ба дижитал системийн интерактив лаборатори</p>
      </div>
      <button class="c-back-btn" id="cExit" type="button" aria-label="Буцах">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        <span>Буцах</span>
      </button>
    </header>

    <!-- Responsive Workspace Layout -->
    <div class="c-layout">
      <!-- Left Sticky Sidebar: Hero Art + Navigation + Stats -->
      <aside class="c-sidebar">
        <div class="c-hero">
          <div class="c-computer-art c-circuit-scene" aria-label="Хөдөлгөөнт компьютерын технологийн дүрслэл">
            <div class="c-orbit c-orbit-one"></div>
            <div class="c-orbit c-orbit-two"></div>
            <div class="c-spark c-spark-one"></div>
            <div class="c-spark c-spark-two"></div>
            <div class="c-spark c-spark-three"></div>
            <div class="c-chip"><div class="c-chip-inner"><span>SU</span><small>CORE</small></div></div>
            <div class="c-node c-node-a">01</div>
            <div class="c-node c-node-b">AI</div>
            <div class="c-node c-node-c">10</div>
            <div class="c-scene-caption">COMPUTING SYSTEM ONLINE <b>●</b></div>
          </div>
        </div>

        <nav class="c-nav" role="tablist" aria-label="Компьютерын лабораторийн цэс">
          <button class="c-nav-btn active" data-cgo="home" type="button">
            <span class="c-nav-icon">⌂</span>
            <span class="c-nav-text">
              <strong class="c-nav-title">Нүүр хуудас</strong>
              <small class="c-nav-sub">Тойм ба үндсэн мэдээлэл</small>
            </span>
            <span class="c-nav-pill">ТӨВ</span>
          </button>
          <button class="c-nav-btn" data-cgo="learn" type="button">
            <span class="c-nav-icon">📚</span>
            <span class="c-nav-text">
              <strong class="c-nav-title">Мэдлэгийн сан</strong>
              <small class="c-nav-sub">26 бүлэг гарын авлага</small>
            </span>
            <span class="c-nav-pill">26</span>
          </button>
          <button class="c-nav-btn" data-cgo="explore" type="button">
            <span class="c-nav-icon">🧩</span>
            <span class="c-nav-text">
              <strong class="c-nav-title">Интерактив судлах</strong>
              <small class="c-nav-sub">Эд анги, урсгал, сүлжээ</small>
            </span>
            <span class="c-nav-pill">СИМ</span>
          </button>
          <button class="c-nav-btn" data-cgo="terms" type="button">
            <span class="c-nav-icon">🔎</span>
            <span class="c-nav-text">
              <strong class="c-nav-title">Нэр томьёо</strong>
              <small class="c-nav-sub">25 нэр томьёоны толь</small>
            </span>
            <span class="c-nav-pill">25</span>
          </button>
        </nav>

        <div class="c-side-card">
          <div class="c-side-head">✦ СИСТЕМИЙН ҮЗҮҮЛЭЛТ</div>
          <div class="c-stats-row">
            <div class="c-stat-item"><span class="c-stat-val">26</span><span class="c-stat-lbl">Сэдэв</span></div>
            <div class="c-stat-item"><span class="c-stat-val">4</span><span class="c-stat-lbl">Симуляци</span></div>
            <div class="c-stat-item"><span class="c-stat-val">25</span><span class="c-stat-lbl">Толь</span></div>
          </div>
        </div>
      </aside>

      <!-- Right Main Content Workspace -->
      <main class="c-main" id="cMain">
        <!-- View 1: Home -->
        <div class="c-view active" data-cview="home">
          <div class="c-banner">
            <h2>Компьютерын шинжлэх ухааны төв</h2>
            <p>Мэдээллийг дүрслэх, боловсруулах, хадгалах, дамжуулах болон асуудлыг алгоритм, программаар шийдэх цогц системтэй танилцаарай.</p>
          </div>

          <div class="c-sectionhead">
            <h2>Судлах үндсэн чиглэлүүд</h2>
            <span>4 модулийн сонголт</span>
          </div>

          <div class="c-grid">
            <button class="c-tile" data-cgo="learn" type="button">
              <span class="c-tile-icon">📚</span>
              <strong class="c-tile-title">Мэдлэгийн сан</strong>
              <p class="c-tile-desc">Гарын авлагын 26 бүлэг сэдэв, дэлгэрэнгүй онол ба жишээ баримтууд.</p>
              <span class="c-tile-action">Унших →</span>
            </button>
            <button class="c-tile" data-cgo="explore" type="button">
              <span class="c-tile-icon">🧩</span>
              <strong class="c-tile-title">Системийг ойлгох</strong>
              <p class="c-tile-desc">Компьютерын эд анги, ажиллах зарчим ба боловсруулалтын дараалал.</p>
              <span class="c-tile-action">Турших →</span>
            </button>
            <button class="c-tile" data-cdemo="network" data-cgo="explore" type="button">
              <span class="c-tile-icon">🌐</span>
              <strong class="c-tile-title">Сүлжээ ба өгөгдөл</strong>
              <p class="c-tile-desc">Пакет дамжуулалт, чиглүүлэгч ба интернетийн мэдээллийн урсгал.</p>
              <span class="c-tile-action">Ажиглах →</span>
            </button>
            <button class="c-tile" data-cgo="terms" type="button">
              <span class="c-tile-icon">🔎</span>
              <strong class="c-tile-title">Нэр томьёо</strong>
              <p class="c-tile-desc">25 гол нэр томьёо, монгол болон англи тайлбар, хэрэглээний жишээ.</p>
              <span class="c-tile-action">Нээх →</span>
            </button>
          </div>

          <div class="c-info-card">
            <h3>✦ Компьютерын шинжлэх ухааны тухай</h3>
            <p>Компьютерын шинжлэх ухаан нь мэдээллийг дүрслэх, боловсруулах, хадгалах, дамжуулах болон асуудлыг алгоритм, программ ашиглан хэрхэн шийдэхийг судалдаг шинжлэх ухаан юм. Энэ нь техник хангамж, программ хангамж, өгөгдөл, хиймэл оюун ухаан, сүлжээ, мэдээллийн аюулгүй байдал зэрэг олон чиглэлийг хамардаг.</p>
          </div>
        </div>

        <!-- View 2: Learn (26 Chapters & Reader) -->
        <div class="c-view" data-cview="learn">
          <div class="c-view-header">
            <div class="c-kicker">KNOWLEDGE LIBRARY // ГАРЫН АВЛАГА</div>
            <h1>Мэдлэгийн сан</h1>
            <p>Таны оруулсан гарын авлагын 26 бүлгийг бүрэн багтаав. Сэдвээ сонгоод уншаарай.</p>
          </div>

          <div id="cList">
            <div class="c-search-wrap">
              <input aria-label="Сэдэв хайх" class="c-search" id="cSearch" placeholder="Сэдэв хайх..." type="search"/>
            </div>
            <div id="cArticles" class="c-articles-grid"></div>
          </div>

          <article class="c-reader" id="cReader">
            <button class="c-readerback" id="cReaderBack" type="button">← Бүх сэдэв рүү буцах</button>
            <div class="c-kicker" id="cReadNum"></div>
            <h2 id="cReadTitle"></h2>
            <div id="cReadBody"></div>
          </article>
        </div>

        <!-- View 3: Explore (Interactive Simulators) -->
        <div class="c-view" data-cview="explore">
          <div class="c-view-header">
            <div class="c-kicker">INTERACTIVE EXPLORER // СИМУЛЯЦИ</div>
            <h1>Интерактив судлах</h1>
            <p>Баримт бичгийн үндсэн ойлголтуудыг интерактив дүрслэл, тооцоолуур ба туршилтаар үзүүлнэ.</p>
          </div>

          <div class="c-demos-grid">
            <!-- Demo 1: Parts -->
            <div class="c-demo">
              <div class="c-demo-top">
                <h3>🖥️ Компьютерын бүрэлдэхүүн</h3>
                <span class="c-demo-badge">ЭД АНГИ</span>
              </div>
              <p>Эд анги дээр дарж үүргийг нь дэлгэрэнгүй харна уу.</p>
              <div id="cParts" class="c-parts-buttons"></div>
              <div class="c-display" id="cPartOutput">Эд ангиа сонгоно уу.</div>
            </div>

            <!-- Demo 2: Pipeline -->
            <div class="c-demo">
              <div class="c-demo-top">
                <h3>🔁 Мэдээлэл боловсруулах үе шат</h3>
                <span class="c-demo-badge">УРСГАЛ</span>
              </div>
              <p>Оролт → Боловсруулалт → Гаралт → Хадгалалт дамжлага.</p>
              <button id="cFlowNext" class="c-action-btn" type="button">Дараагийн үе шат →</button>
              <div class="c-progress"><i id="cFlowBar"></i></div>
              <div class="c-display" id="cFlowOutput"></div>
            </div>

            <!-- Demo 3: Binary -->
            <div class="c-demo">
              <div class="c-demo-top">
                <h3>🔢 Хоёртын дүрслэл (Binary 8-Bit)</h3>
                <span class="c-demo-badge">ХӨРВҮҮЛЭГЧ</span>
              </div>
              <p>0–255 хүртэлх бүхэл тоо компьютерт 8 битээр хэрхэн дүрслэгдэхийг хар.</p>
              <input aria-label="Бүхэл тоо" id="cBinaryInput" class="c-num-input" inputmode="numeric" max="255" min="0" type="number" value="42"/>
              <div class="c-display" id="cBinaryOutput"></div>
            </div>

            <!-- Demo 4: Network -->
            <div class="c-demo" id="cNetworkDemo">
              <div class="c-demo-top">
                <h3>🌐 Сүлжээний аялал (Packet Routing)</h3>
                <span class="c-demo-badge">СҮЛЖЭЭ</span>
              </div>
              <p>Өгөгдөл А компьютероос чиглүүлэгчээр дамжин В компьютерт хүрэх энгийн загвар.</p>
              <button id="cNetworkRun" class="c-action-btn" type="button">Пакет дамжуулах →</button>
              <div class="c-display" id="cNetworkOutput">💻 A     · · ·     📡 Router     · · ·     💻 B</div>
            </div>
          </div>
        </div>

        <!-- View 4: Terms (Glossary) -->
        <div class="c-view" data-cview="terms">
          <div class="c-view-header">
            <div class="c-kicker">QUICK REFERENCE // ТОЛЬ БИЧИГ</div>
            <h1>Нэр томьёоны толь</h1>
            <p>Компьютерын үндсэн ойлголтуудыг жишээтэй, дэлгэрэнгүй тайлбарлав. Нийт 25 нэр томьёо.</p>
          </div>
          <div id="cTerms" class="c-terms-grid"></div>
        </div>
      </main>
    </div>
  </div>
</section>`;
}


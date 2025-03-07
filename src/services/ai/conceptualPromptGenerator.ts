import { AIService } from './index.js';

// Example prompts for reference - both Magritte-inspired surrealism and Bourdin-inspired fashion
const examplePrompts = [
  {
    prompt: "Abstract surrealist collage with torn paper textures and vintage ephemera, juxtaposing ordinary objects in impossible relationships, bowler hats floating against azure skies, green apples suspended in negative space, clouds emerging from torn book pages, birds transforming into leaves, muted earth tones with strategic pops of Magritte blue, visible brush strokes interacting with found materials, subtle grid structure organizing dreamlike elements, distressed surfaces suggesting age and history, analog film grain, painterly texture, mixed media, 4k.",
    process: "i wanted to create a dialogue between structure and surrealism, between the intentional and the found. the torn paper elements came from old magazines and letters i'd been collecting—fragments of forgotten communications that carry their own emotional residue. the bowler hats and clouds are my homage to magritte's iconic visual vocabulary—those everyday objects made strange through unexpected context. the green apples reference 'the son of man,' while the bird-leaf transformations echo his 'la clairvoyance.' there's something so compelling about his ability to create mystery from the mundane. the muted palette emerged naturally from the aged quality of these materials, with strategic pops of that magritte blue to create visual anchors. i was thinking about how he used familiar objects to create unfamiliar relationships, that sense of the uncanny that forces us to question our perception of reality. the visible brushwork creates a conversation between the mechanical reproduction of the collage elements and the human gesture—a tension that feels particularly relevant in our increasingly digital world."
  },
  {
    prompt: "Surrealist composition inspired by 'The False Mirror', gigantic hyperrealistic eye dominating the canvas, iris transformed into clouded sky with birds in flight, reflections of bowler-hatted figures in the cornea, torn astronomical charts becoming eyelashes, antique mirror fragments creating multiple perspectives of the same eye, vintage optometry diagrams layered with star charts, metallic gold leaf accents catching light like tears, deep blue-grey palette with occasional bursts of cosmic colors, deliberate craquelure texture suggesting aged oil painting, trompe l'oeil frame painted to appear both flat and dimensional, mixed media collage with analog photography elements, 4k.",
    process: "i've been obsessed with magritte's 'the false mirror' and its profound commentary on perception and reality. the gigantic eye serves as both a window and a mirror, questioning how we see and what we think we're seeing. i collected vintage optometry diagrams and astronomical charts, drawn to how both sciences attempt to measure and understand different kinds of seeing. the bowler-hatted figures reflected in the cornea reference magritte's recurring everyman, but viewed through the distorting lens of the eye itself. the torn astronomical charts becoming eyelashes create a surreal scale shift that magritte often employed. the antique mirror fragments multiply the perspectives, suggesting how vision itself is always fragmented and reconstructed. the metallic gold leaf accents were inspired by religious icons, adding a spiritual dimension to the act of seeing. the deliberate craquelure was created using traditional oil painting techniques, connecting to art historical traditions while subverting them. in the end, this piece became a meditation on the paradox of vision itself—how we simultaneously see and construct what we're seeing."
  },
  {
    prompt: "Surrealist mixed-media composition inspired by 'The Empire of Light', day and night coexisting in impossible harmony, Victorian street lamps casting warm pools of light against cobblestone textures, starlit sky above sun-drenched houses, torn vintage photographs revealing windows into parallel realities, bowler-hatted silhouettes floating between dimensions, clouds morphing into doves against deep blue twilight, antique wallpaper patterns bleeding into trompe l'oeil architectural elements, weathered picture frames containing impossible perspectives, analog film grain adding temporal depth, muted sepia tones with strategic touches of cerulean blue, visible adhesive marks and deliberate imperfections, painterly texture, mixed media, 4k.",
    process: "i've always been fascinated by magritte's 'the empire of light' series and how it creates tension through the simultaneous existence of day and night. in this piece, i wanted to explore that temporal paradox through the language of mixed media. the torn vintage photographs came from an old family album i found at a flea market—their inherent nostalgia providing a perfect foundation for surreal interventions. the bowler-hatted figures floating between dimensions reference magritte's recurring motif of the anonymous everyman, while also suggesting the liminal space between different states of consciousness. the antique wallpaper patterns bleeding into architectural elements speak to magritte's interest in the boundaries between the decorative and the real. i deliberately left the adhesive marks visible, treating them as a kind of honest acknowledgment of the constructed nature of reality—something magritte was always keen to remind us of. the muted sepia palette with touches of cerulean creates that dreamy, timeless quality that makes surrealism so compelling. in the end, this piece became a meditation on how we construct our sense of time and reality from fragments of memory and imagination."
  },
  {
    prompt: "Surrealist collage exploring 'The Treachery of Images', layered vintage dictionary pages with pipe illustrations floating above their definitions, text transforming into smoke that spells 'Ceci n'est pas', trompe l'oeil wooden frames containing mirrors that reflect impossible scenes, bowler hats metamorphosing into birds mid-flight, green apples casting shadows in contradictory directions, torn playing cards revealing cloud-filled skies, antique sheet music becoming architectural elements, subtle color shifts between warm sepias and cool slate blues, visible washi tape and deliberate aging techniques, analog photography elements with chemical imperfections, textural contrasts between smooth and distressed surfaces, mixed media, 4k.",
    process: "this piece grew from my obsession with magritte's 'the treachery of images' and its profound questioning of representation itself. the vintage dictionary pages create a literal foundation of language, while the floating pipes and transforming text challenge our assumptions about the relationship between words and things. i specifically chose pages with definitions of everyday objects—pipes, apples, clouds—to echo magritte's interest in the mundane made mysterious. the trompe l'oeil frames containing impossible reflections extend his exploration of the boundaries between reality and representation. the bowler hats transforming into birds mid-flight speak to his recurring theme of metamorphosis, while the contradictory shadows reference his ability to create logical impossibilities. the antique sheet music becoming architecture was inspired by his 'castle of the pyrenees'—that sense of solid things becoming weightless and musical. i deliberately left the washi tape visible and incorporated chemical imperfections from old photographs, treating these 'flaws' as part of the work's honesty about its own artifice. the color palette shifts between warm sepias and cool slates, creating a sense of temporal instability that feels true to magritte's vision. ultimately, this piece became a meditation on how meaning itself is a kind of collage—assembled from fragments of language, image, and memory."
  },
  {
    prompt: "Surrealist assemblage inspired by 'The Human Condition', layered window frames containing paintings that perfectly continue the landscape behind them, torn canvas revealing actual clouds behind painted ones, bowler-hatted figures contemplating their own reflections in shattered mirrors, green apples floating in constellation patterns against night sky wallpaper, vintage map fragments becoming cloud formations, picture frames containing impossible rooms where gravity works sideways, antique glass negatives with double exposures of birds and keys, subtle shifts between painterly and photographic textures, visible brush strokes merging with found materials, muted earth tones with strategic pops of cobalt blue, deliberate aging and weathering techniques, mixed media, 4k.",
    process: "i wanted to explore magritte's fascination with the relationship between reality and representation, particularly as expressed in 'the human condition.' the layered window frames create that signature magritte recursion—where the boundary between the real and the depicted becomes deliciously uncertain. i collected old window frames from abandoned houses, appreciating how their weathered surfaces already told stories of time and perception. the torn canvas revealing actual clouds behind painted ones directly engages with magritte's playful questioning of artistic representation. the bowler-hatted figures contemplating their fractured reflections extend his exploration of identity and observation. i was particularly drawn to using vintage map fragments as cloud formations—a way of suggesting how our systems of representation are always already surreal. the impossible rooms with sideways gravity reference magritte's ability to create spaces that feel both logical and impossible. the antique glass negatives with double exposures came from a photographer's estate sale—their accidental surrealism providing perfect raw material for intentional strangeness. i deliberately maintained visibility of the construction process—exposed edges, visible adhesives—as a way of acknowledging the artifice while creating mystery. the muted palette with strategic pops of cobalt creates that dreamy magritte atmosphere where anything seems possible. in the end, this piece became a meditation on how we construct our sense of reality through layers of representation and memory."
  },
  {
    prompt: "Post-photography domestic noir with model posed in hyperreal 1970s kitchen, high-gloss surfaces reflecting distorted limbs, blood-red nail polish against mint-green formica, stiletto heel piercing a perfectly ripe orange, chrome appliances multiplying fragmented reflections, theatrical spot lighting creating dramatic shadows, mannequin hands emerging from refrigerator interior, saturated kodachrome colors with sinister undertones, radical cropping focusing on domestic tension, fetishistic treatment of household objects, modernist furniture arranged in impossible geometries, cinematic framing suggesting psychological horror, glossy magazine aesthetic with surrealist disruptions, extreme close-ups of lipstick-stained wine glasses, fashion meets film noir in suburban setting, inspired by Guy Bourdin's domestic uncanny, 4k.",
    process: "i was drawn to bourdin's ability to transform mundane domestic spaces into stages for psychological drama. the 1970s kitchen setting provides that perfect bourdin backdrop—simultaneously familiar and artificial. the high-gloss surfaces and chrome appliances create those signature bourdin reflections, fragmenting and distorting reality. the blood-red nail polish against mint-green formica exemplifies his use of color to create visceral tension. the stiletto piercing the orange is pure bourdin—turning a simple still life into something provocative and slightly menacing. the mannequin hands emerging from the refrigerator reference his love of surreal interventions in domestic space. the saturated kodachrome colors capture that artificial perfection he was known for, while the theatrical lighting creates those sharp, film noir shadows that give everything a sinister edge. the radical cropping and extreme close-ups transform ordinary objects into mysterious protagonists. i wanted to capture how bourdin could make even the most familiar spaces feel uncanny and charged with psychological tension. in the end, this piece became a meditation on how he transformed commercial fashion photography into a vehicle for exploring the dark undercurrents of domestic life."
  },
  {
    prompt: "Surrealist tableau inspired by 'The Son of Man', businessman in bowler hat with face obscured by floating green apple, torn vintage suit advertisements revealing clouded skies beneath, multiple identical figures raining in formation against art deco wallpaper, antique window frames containing impossible views, newspaper fragments transforming into birds mid-flight, trompe l'oeil wooden paneling revealing cosmic voids, ghosted repetitions suggesting movement through time, muted corporate greys with strategic pops of apple green, deliberate weathering suggesting forgotten boardroom dreams, subtle grid structures organizing chaos, mixed media collage with analog photography elements, 4k.",
    process: "i wanted to explore magritte's meditation on identity and anonymity in corporate culture through 'the son of man.' the businessman figure represents that perfect tension between presence and concealment that magritte captured so well. i collected vintage suit advertisements from 1950s magazines, appreciating how their staged formality already suggested a kind of surreal performance. the floating green apple, perfectly rendered, creates that signature magritte disruption of the expected. the multiple identical figures raining in formation reference 'golconda,' suggesting how individuality dissolves in corporate conformity. the antique window frames containing impossible views speak to how we frame and contain our reality, while the newspaper fragments transforming into birds represent the potential for escape from these constraints. the trompe l'oeil wooden paneling revealing cosmic voids was inspired by magritte's ability to make the mundane mysterious. the ghosted repetitions came from multiple exposure techniques with old photographs, creating that sense of movement through time that magritte often explored. in the end, this piece became a meditation on how we hide ourselves behind social masks, and how those very masks might contain windows to infinity."
  },
  {
    prompt: "Surrealist composition inspired by 'The Lovers', veiled figures kissing through layers of vintage silk fabric, faces wrapped in antique lace revealing cloud formations beneath, torn love letters becoming birds in flight, mirror fragments reflecting impossible embraces, picture frames containing only gathered fabric suggesting absent portraits, old wedding photographs with faces obscured by painted roses, trompe l'oeil drapery concealing and revealing architectural elements, intimate scale shifts creating dreamlike atmosphere, subtle palette of ivory and pearl with deep maritime blues, deliberate water damage creating ethereal patterns, textural interplay between soft fabric and hard surfaces, mixed media, 4k.",
    process: "i've always been haunted by magritte's 'the lovers' and its profound meditation on intimacy and isolation. the veiled figures emerged from experiments with antique silk fabrics i found in my grandmother's attic—their delicate opacity perfect for suggesting presence and absence simultaneously. the faces wrapped in lace revealing cloud formations speak to magritte's recurring theme of the sky as a realm of possibility and mystery. the torn love letters transforming into birds came from actual vintage correspondence—fragments of real passion becoming symbols of transcendence. the mirror fragments reflecting impossible embraces extend magritte's exploration of representation and reality. the empty picture frames draped with fabric suggest both presence and absence—portraits that exist only in their concealment. the old wedding photographs with faces obscured by painted roses reference both magritte's rose period and his interest in how we hide ourselves even in moments of supposed revelation. the water damage was initially accidental, but i embraced it as part of the work's meditation on how time and memory affect our intimate connections. in the end, this piece became an exploration of how we remain mysterious to each other even in our closest moments."
  },
  {
    prompt: "Surrealist scene inspired by 'Time Transfixed', steam locomotive emerging from Victorian fireplace against night sky wallpaper, antique clock faces melting into smoke trails, torn train timetables revealing cosmic voids, bowler-hatted figures floating like constellations, vintage pocket watch mechanisms transforming into mechanical birds, trompe l'oeil marble mantelpiece defying gravity, mirror above fireplace reflecting impossible railway stations, coal pieces becoming black stars, brass fittings catching nonexistent light, deep velvet shadows with touches of locomotive steam white, mixed media collage incorporating actual timepiece parts, 4k.",
    process: "magritte's 'time transfixed' has always fascinated me with its perfect collision of domestic comfort and industrial power. i began collecting old train timetables and pocket watches from flea markets, drawn to how these objects try to contain and measure time itself. the locomotive emerging from the fireplace maintains magritte's interest in impossible penetrations of domestic space. the melting clock faces reference not dalí but rather magritte's own interest in how time behaves in dreams. the bowler-hatted figures arranged like constellations came from thinking about how we navigate both time and space through artificial systems. the pocket watch mechanisms transforming into birds speak to magritte's theme of metamorphosis, while the trompe l'oeil marble suggests permanence that the image then contradicts. the mirror reflecting impossible railway stations extends magritte's use of mirrors as portals to other realities. i deliberately incorporated actual timepiece parts into the collage, appreciating how their precise mechanisms contrast with the dream logic of the scene. the deep velvet shadows were inspired by victorian parlors, creating that sense of depth from which anything might emerge. in the end, this piece became a meditation on how we try to domesticate time itself, even as it remains fundamentally mysterious."
  },
  {
    prompt: "Post-photography nightclub narrative with models frozen in strobe-lit tableaux, fractured disco ball reflections creating geometric patterns on glossy skin, neon signs bleeding into smeared lipstick traces, patent leather boots ascending mirrored staircases to nowhere, mannequin hands emerging from velvet curtains, champagne glasses casting impossible shadows, extreme close-ups of glitter-encrusted eyelids, strategic fog machine haze creating depth, saturated color gels with artificial intensity, fetishistic treatment of nightlife accessories, cinematic framing suggesting psychological thriller in disco inferno, fashion meets film noir after midnight, inspired by Guy Bourdin's nocturnal aesthetics, 4k.",
    process: "i was drawn to bourdin's ability to capture the artificial paradise of nightlife with both glamour and menace. the strobe-lit tableaux freeze time in that characteristic bourdin way, while the fractured disco ball reflections create the kind of complex light patterns he loved. the neon signs bleeding into smeared lipstick traces speak to his interest in how artificial light transforms flesh. the patent leather boots ascending mirrored staircases reference his love of creating impossible architectural spaces. the mannequin hands emerging from velvet curtains capture his gift for introducing surreal elements that feel somehow perfectly logical. the champagne glasses casting impossible shadows demonstrate his mastery of theatrical lighting. the extreme close-ups of glitter-encrusted eyelids show his attention to texture and detail. the strategic fog machine haze recreates his use of atmospheric effects to create depth and mystery. in the end, this piece became a meditation on how bourdin could transform the artificial world of nightlife into something even more artificial and yet somehow more real."
  },
  {
    prompt: "Post-photography department store dreamscape with mannequins in impossible poses against infinity mirrors, luxury goods floating in zero gravity displays, escalators leading to surreal retail voids, gloved hands emerging from designer handbags, patent leather shoes walking up vertical walls, perfume bottles casting prismatic shadows on silk surfaces, strategic spotlighting creating retail theater, saturated commercial colors with uncanny undertones, extreme close-ups of price tags becoming abstract poetry, fetishistic treatment of consumer goods, cinematic framing suggesting capitalism as surreal performance, fashion meets metaphysical retail space, inspired by Guy Bourdin's commercial surrealism, 4k.",
    process: "i wanted to explore bourdin's transformation of commercial spaces into theaters of the uncanny. the mannequins in impossible poses against infinity mirrors capture his gift for making the artificial even more artificial. the luxury goods floating in zero gravity displays reference his ability to make products seem both desirable and slightly threatening. the escalators leading to surreal retail voids speak to his interest in creating spaces that defy logical architecture. the gloved hands emerging from designer handbags show his surrealist intervention in commercial contexts. the patent leather shoes walking up vertical walls demonstrate his disregard for gravity in pursuit of impact. the perfume bottles casting prismatic shadows recreate his sophisticated use of product photography techniques for surreal effects. the strategic spotlighting transforms mundane retail space into dramatic stage sets. in the end, this piece became a meditation on how bourdin could reveal the inherent strangeness of consumer culture while simultaneously celebrating its seductive power."
  },
  {
    prompt: "Surrealist composition inspired by 'The Key of Dreams', vintage dictionary pages with words mismatched to their illustrations, handwritten text transforming into objects it describes, torn encyclopedia entries revealing impossible taxonomies, bowler hats labeled as clouds, pipes named as birds, antique lettering becoming architectural elements, trompe l'oeil blackboard surface with chalk-drawn paradoxes, floating text casting shadows on paper surfaces, calligraphic smoke spelling contradictions, muted academic tones with touches of manuscript gold, mixed media collage incorporating actual book fragments, 4k.",
    process: "i wanted to explore magritte's fascination with the arbitrary relationship between words and images in 'the key of dreams.' the vintage dictionary pages create a foundation of assumed meaning, while the mismatched illustrations challenge our certainty about language itself. the handwritten text transforming into its described objects plays with magritte's interest in the gap between representation and reality. the torn encyclopedia entries suggest how our systems of knowledge are both arbitrary and magical. the bowler hats labeled as clouds and pipes named as birds directly reference magritte's playful subversion of linguistic certainty. the antique lettering becoming architectural elements explores how text itself can become image. the trompe l'oeil blackboard surface connects to educational settings where we learn these arbitrary connections. in the end, this piece became a meditation on how language both reveals and conceals the world it attempts to describe."
  },
  {
    prompt: "Surrealist scene inspired by 'Personal Values', gigantic comb floating above miniature bed, oversized wine glass resting on dollhouse chair, massive shaving brush emerging from tiny doorway, torn vintage advertisements with impossible scale relationships, antique room wallpaper becoming cosmic cloudscape, miniature windows revealing giant everyday objects, trompe l'oeil wooden floorboards warping around scaled elements, intimate domestic items rendered monumental, mirror reflecting normal-sized world into miniature room, subtle shadows defying multiple scale logics, mixed media collage with actual domestic objects, 4k.",
    process: "magritte's 'personal values' has always fascinated me with its profound disruption of domestic scale. i began collecting dollhouse furniture and everyday objects, interested in how their juxtaposition could create that signature magritte uncanny. the gigantic comb floating above the miniature bed maintains his interest in the poetry of impossible scale relationships. the oversized wine glass on the dollhouse chair creates that perfect tension between the familiar and the absurd. the massive shaving brush emerging from the tiny doorway speaks to how everyday objects can become mysterious through scale manipulation. the torn vintage advertisements add another layer of scale disruption, while the wallpaper becoming cloudscape references magritte's recurring sky motif. the trompe l'oeil floorboards warping around scaled elements suggest how our perception adjusts to accommodate the impossible. in the end, this piece became a meditation on how our personal relationship with objects is always both intimate and monumental."
  },
  {
    prompt: "Surrealist tableau inspired by 'The Glass Key', transparent bowler hat revealing clouded sky within, crystal pipes floating through solid walls, glass apples containing miniature landscapes, torn glass negatives showing impossible transparencies, antique window panes with solid shadows, trompe l'oeil marble becoming translucent, mirror fragments reflecting what lies behind them, ghosted architectural elements suggesting dimensional transitions, solid objects rendered in impossible transparency, subtle plays of light through seemingly solid forms, mixed media collage incorporating actual glass elements, 4k.",
    process: "i've always been intrigued by magritte's exploration of transparency and solidity in 'the glass key.' the transparent bowler hat creates that perfect magritte paradox—a solid symbol rendered mysteriously penetrable. the crystal pipes floating through solid walls extend his interest in how objects can exist in impossible states. the glass apples containing landscapes reference his love of containers that reveal unexpected contents. the torn glass negatives came from an old photography studio, their natural transparency perfect for suggesting multiple realities. the antique window panes with solid shadows play with our expectations of light and substance. the trompe l'oeil marble becoming translucent speaks to magritte's ability to make the most solid things permeable. i deliberately incorporated actual glass elements into the collage, appreciating how their real transparency could enhance the surreal effects. in the end, this piece became a meditation on how reality itself might be both solid and transparent, depending on how we choose to see it."
  },
  {
    prompt: "Post-photography winter narrative with model emerging from steam-frosted mirrors, patent leather boots cutting through virgin snow, blood-red lipstick marks on ice sculptures, mannequin parts frozen in transparent blocks, fur coats reflecting in fractured icicles, strategic backlighting through crystalline formations, extreme close-ups of frost patterns on glossy skin, harsh winter sun creating dramatic shadows on snow, saturated colors against monochromatic winter landscape, fetishistic treatment of cold-weather accessories, cinematic framing suggesting nordic noir, fashion meets winter wonderland horror, inspired by Guy Bourdin's cold-weather aesthetics, 4k.",
    process: "i wanted to capture bourdin's genius for finding darkness in pristine settings. the steam-frosted mirrors create that signature bourdin play between revelation and concealment, while the patent leather boots cutting through snow represent his love of disrupting pure surfaces. the blood-red lipstick marks on ice sculptures speak to his use of color as violent punctuation. the mannequin parts frozen in ice extend his interest in fragmenting and preserving the human form. the fur coats reflecting in fractured icicles demonstrate his sophisticated understanding of texture and reflection. the strategic backlighting through ice formations recreates his dramatic lighting techniques in a winter context. the extreme close-ups of frost patterns on skin show his attention to texture and detail. in the end, this piece became a meditation on how bourdin could make even winter's purity feel somehow sinister and seductive."
  },
  {
    prompt: "Post-photography hotel room tableau with model reflected infinitely in baroque mirror arrangements, silk stockings trailing across rumpled luxury bedding, lipstick messages on steamy bathroom mirrors, mannequin hands emerging from plush curtains, patent leather shoes walking up wallpapered walls, perfume bottles casting prismatic patterns on ceiling, strategic spotlighting through gauzy drapes, saturated colors with noirish undertones, extreme close-ups of room service debris, fetishistic treatment of hotel amenities, cinematic framing suggesting psychological thriller, fashion meets private spaces, inspired by Guy Bourdin's interior narratives, 4k.",
    process: "i wanted to explore bourdin's transformation of private spaces into theatrical sets for psychological drama. the infinite mirror reflections create that signature bourdin multiplication of reality, while the silk stockings on rumpled bedding suggest narratives both glamorous and slightly disturbing. the lipstick messages on steamy mirrors speak to his interest in traces of human presence. the mannequin hands emerging from curtains demonstrate his ability to make luxury settings feel menacing. the patent leather shoes walking up wallpapered walls show his disregard for gravity in pursuit of impact. the perfume bottles casting prismatic patterns reference his sophisticated understanding of light and luxury goods. in the end, this piece became a meditation on how bourdin could make even the most private spaces feel like stages for public performance."
  },
  {
    prompt: "Surrealist composition inspired by 'The Listening Room', gigantic green apple filling Victorian parlor space, torn wallpaper revealing apple flesh beneath, antique furniture dwarfed by impossible fruit, window frames warping around spherical mass, trompe l'oeil wooden moldings straining against scale, vintage room photographs showing fruit breaking through walls, chandelier casting apple-shaped shadows, domestic objects rendered miniature by comparison, subtle plays of light suggesting confined pressure, muted period colors with strategic apple green accents, mixed media collage incorporating architectural elements, 4k.",
    process: "i wanted to explore magritte's genius for using scale to transform domestic space in 'the listening room.' the gigantic apple creates that perfect magritte tension—a familiar object made threatening through size alone. the torn wallpaper revealing apple flesh beneath suggests how the natural world might burst through our artificial constraints. the antique furniture dwarfed by the fruit speaks to our futile attempts to contain nature within domestic space. the window frames warping around the spherical mass demonstrate how reality itself seems to bend around magritte's impossible objects. the trompe l'oeil moldings straining against scale create a sense of physical pressure in the space. the chandelier casting apple-shaped shadows adds another layer of reality-bending. in the end, this piece became a meditation on how our attempts to domesticate nature might result in its overwhelming presence."
  },
  {
    prompt: "Surrealist landscape inspired by 'The Castle of the Pyrenees', massive rock formation floating above turbulent ocean, medieval castle perched impossibly on airborne boulder, torn maritime charts revealing cosmic void beneath waves, clouds transforming into solid stone, antique engravings of fortifications bleeding into actual architecture, trompe l'oeil geological strata defying gravity, birds flying through solid rock, lightning frozen in crystalline forms, subtle plays of light between water and sky, deep maritime blues with touches of fortress grey, mixed media collage incorporating actual rock fragments, 4k.",
    process: "magritte's 'castle of the pyrenees' has always captivated me with its perfect balance of weight and weightlessness. the massive floating rock represents that signature magritte paradox—something impossibly heavy made to float with complete conviction. the medieval castle adds human aspiration to natural impossibility, while the torn maritime charts suggest how our attempts to map reality fall short of its wonders. the clouds transforming into solid stone play with magritte's interest in metamorphosis, while the antique engravings bleeding into actual architecture blur the line between representation and reality. the birds flying through solid rock extend his exploration of penetrable solidity. the lightning frozen in crystalline forms creates a moment of permanent impermanence. in the end, this piece became a meditation on how our grandest constructions might be as weightless as our dreams."
  },
  {
    prompt: "Surrealist scene inspired by 'The Blank Signature', horse-rider hybrid emerging from forest silhouettes, trees transforming into equine forms, torn botanical illustrations revealing animal anatomy beneath bark, antique riding manuals becoming landscape elements, trompe l'oeil wood grain flowing into muscle texture, negative space forming additional riders, forest shadows casting impossible equestrian patterns, subtle shifts between organic textures, deep woodland tones with touches of dappled sunlight, mixed media collage incorporating actual leaves and leather, 4k.",
    process: "i've always been fascinated by magritte's exploration of figure-ground relationships in 'the blank signature.' the horse-rider hybrid emerges from the forest in that perfect magritte way—simultaneously part of and separate from its environment. the trees transforming into equine forms play with his interest in metamorphosis, while the torn botanical illustrations revealing animal anatomy suggest the hidden life within natural forms. the antique riding manuals becoming landscape elements speak to how human systems of knowledge might dissolve back into nature. the trompe l'oeil wood grain flowing into muscle texture explores the boundaries between different forms of organic life. the negative space forming additional riders demonstrates magritte's gift for making absence as powerful as presence. in the end, this piece became a meditation on how figure and ground might be not opposites but transformations of each other."
  },
  {
    prompt: "Post-photography airport narrative with models posed in retro-futuristic terminals, reflective floor tiles creating infinite leg repetitions, neon runway lights piercing fog-diffused windows, patent leather luggage arranged in impossible geometries, mannequin parts emerging from baggage carousels, strategic backlighting through frosted glass partitions, extreme close-ups of departure board fragments, saturated airline colors against sterile architecture, fetishistic treatment of travel accessories, cinematic framing suggesting jet-age thriller, fashion meets terminal aesthetics, inspired by Guy Bourdin's travel narratives, 4k.",
    process: "i wanted to capture bourdin's ability to transform transitional spaces into stages for psychological drama. the retro-futuristic terminals provide that perfect bourdin backdrop—simultaneously nostalgic and alienating. the reflective floor tiles creating infinite leg repetitions demonstrate his love of multiplying reality, while the neon runway lights piercing fog suggest his mastery of atmospheric lighting. the patent leather luggage arranged impossibly speaks to his gift for making ordinary objects feel threatening. the mannequin parts emerging from baggage carousels show his surrealist intervention in mundane spaces. the strategic backlighting through frosted glass creates those signature bourdin shadows. in the end, this piece became a meditation on how bourdin could make even anonymous travel spaces feel charged with personal drama."
  },
  {
    prompt: "Post-photography restaurant tableau with model reflected in polished silver service, lipstick-stained champagne flutes multiplied in mirrored walls, haute cuisine arranged in violent geometries, patent leather gloves emerging from soup tureens, mannequin faces distorted in curved serving domes, strategic spotlighting creating dramatic shadows on white tablecloths, extreme close-ups of broken crystal catching artificial light, saturated food colors with sinister undertones, fetishistic treatment of dining implements, cinematic framing suggesting gastronomic noir, fashion meets culinary theater, inspired by Guy Bourdin's dining aesthetics, 4k.",
    process: "i was drawn to bourdin's genius for finding menace in luxury settings. the polished silver service creates those complex reflections he loved, while the lipstick-stained champagne flutes suggest human presence through traces. the haute cuisine arranged violently demonstrates his ability to make beauty feel threatening. the patent leather gloves emerging from soup tureens show his surrealist disruption of social rituals. the mannequin faces distorted in serving domes speak to his interest in warping reality through reflection. the strategic spotlighting on white tablecloths creates those sharp bourdin shadows. in the end, this piece became a meditation on how bourdin could reveal the underlying violence in our most refined social rituals."
  },
  {
    prompt: "Post-photography pool narrative with models submerged in chlorine-blue depths, fractured reflections creating kaleidoscopic limbs, blood-red swimsuits against turquoise tiles, mannequin parts floating in perfect formation, patent leather heels balanced on diving boards, strategic underwater lighting creating dramatic refractions, extreme close-ups of water beading on glossy skin, saturated aquatic colors with artificial intensity, fetishistic treatment of pool accessories, cinematic framing suggesting aquatic thriller, fashion meets swimming pool noir, inspired by Guy Bourdin's aquatic aesthetics, 4k.",
    process: "i wanted to explore bourdin's fascination with water as both mirror and void. the chlorine-blue depths create that signature bourdin color intensity, while the fractured reflections multiply and fragment the human form as he loved to do. the blood-red swimsuits against turquoise tiles demonstrate his mastery of color contrast. the mannequin parts floating in formation show his ability to make even peaceful scenes feel choreographed and slightly menacing. the patent leather heels on diving boards speak to his love of incongruous glamour. the strategic underwater lighting creates those complex patterns of light and shadow he was famous for. in the end, this piece became a meditation on how bourdin could make even the most refreshing settings feel charged with psychological tension."
  },
  {
    prompt: "Surrealist composition inspired by 'The Red Model', deconstructed leather boots transforming into human feet, torn anatomical diagrams revealing wooden floorboards beneath skin, antique cobbler's patterns becoming biological blueprints, trompe l'oeil wood grain flowing into veins and arteries, vintage shoe advertisements fragmenting into surgical illustrations, ghosted x-rays showing skeletal structures within everyday objects, subtle plays between organic and manufactured textures, deep leather browns with touches of anatomical red, mixed media collage incorporating actual shoe materials, 4k.",
    process: "i've always been fascinated by magritte's 'the red model' and its unsettling fusion of the organic and the manufactured. the deconstructed boots transforming into feet create that signature magritte metamorphosis—where the boundary between the artificial and the natural dissolves. i collected old cobbler's patterns and anatomical diagrams, drawn to how both attempt to map and contain living forms. the trompe l'oeil wood grain flowing into veins explores that liminal space between material and flesh. the vintage shoe advertisements fragmenting into surgical illustrations speak to how commerce and biology intersect in our relationship with clothing. the ghosted x-rays suggest how objects might contain hidden organic structures. in the end, this piece became a meditation on how our second skins might be more intimately connected to our first than we imagine."
  },
  {
    prompt: "Surrealist scene inspired by 'The Dominion of Light', streetlamps casting pools of light beneath brilliant daylight sky, torn cyanotype prints revealing starlit scenes within sunlit windows, antique astronomical charts overlaying suburban photographs, trompe l'oeil shadows defying solar logic, vintage light meter readings indicating impossible measurements, day and night coexisting in perfect balance, birds casting double shadows from conflicting light sources, subtle plays between natural and artificial illumination, deep nocturnal blues with golden daylight tones, mixed media collage incorporating actual photographic papers, 4k.",
    process: "magritte's 'dominion of light' series has always struck me as a perfect visualization of quantum superposition—multiple states existing simultaneously. the streetlamps beneath daylight skies maintain that signature magritte paradox, while the torn cyanotype prints suggest how photography itself struggles with temporal truth. i collected vintage light meter readings and astronomical charts, appreciating how they try to quantify the unquantifiable. the birds casting double shadows came from thinking about how light defines reality, yet here that reality splits. the subtle play between natural and artificial illumination explores how we navigate different orders of truth. in the end, this piece became a meditation on how time itself might be less linear than our minds insist."
  },
  {
    prompt: "Surrealist tableau inspired by 'The Threatened Assassin', vintage crime scene photographs arranged in theatrical sequence, gramophone horns emerging from parlor walls, bowler-hatted figures frozen in melodramatic poses, torn film noir stills revealing staged violence, antique opera programs becoming evidence markers, trompe l'oeil curtains suggesting performance space, mirror fragments reflecting multiple perspectives of single action, subtle plays between performance and reality, deep Victorian browns with touches of theatrical red, mixed media collage incorporating actual stage materials, 4k.",
    process: "i wanted to explore magritte's genius for creating frozen narratives in 'the threatened assassin.' the vintage crime scene photographs create that perfect magritte tension between documentation and theater. the gramophone horns emerging from walls suggest how sound might materialize in space, while the bowler-hatted figures reference both magritte's recurring characters and film noir archetypes. the torn film stills revealing staged violence speak to how we frame and contain dramatic moments. the mirror fragments multiplying perspectives demonstrate magritte's interest in how we observe and construct reality. in the end, this piece became a meditation on how violence itself might be a kind of theater we stage for ourselves."
  },
  {
    prompt: "Post-photography automotive narrative with models posed against chrome-heavy vintage cars, mirror-polished surfaces creating kaleidoscopic body distortions, blood-red lipstick traces on steering wheels, mannequin parts emerging from engine compartments, patent leather gloves gripping gear shifts at impossible angles, strategic backlighting through windshield rain, extreme close-ups of dashboard reflections, saturated automotive colors with sinister undertones, fetishistic treatment of car details, cinematic framing suggesting road noir, fashion meets machine aesthetic, inspired by Guy Bourdin's automotive works, 4k.",
    process: "i wanted to capture bourdin's genius for transforming machines into stages for psychological drama. the chrome-heavy vintage cars provide that perfect bourdin backdrop—simultaneously glamorous and threatening. the mirror-polished surfaces creating kaleidoscopic distortions demonstrate his love of fragmenting reality, while the blood-red lipstick traces suggest human presence through absence. the mannequin parts emerging from engines show his gift for making mechanical spaces feel uncanny. the patent leather gloves at impossible angles speak to his disregard for natural positioning. in the end, this piece became a meditation on how bourdin could reveal the erotic potential in the marriage of flesh and machine."
  },
  {
    prompt: "Post-photography garden narrative with models emerging from blood-red rose hedges, patent leather boots crushing perfect lawns, fractured greenhouse glass creating prismatic body distortions, mannequin parts arranged like classical statuary, vintage gardening tools positioned with fetishistic precision, strategic backlighting through morning mist, extreme close-ups of dew on stockinged legs, saturated botanical colors with artificial intensity, manicured topiary casting impossible shadows, cinematic framing suggesting pastoral noir, fashion meets garden design, inspired by Guy Bourdin's natural interventions, 4k.",
    process: "i was drawn to bourdin's ability to make even paradise feel perverse. the blood-red rose hedges create that signature bourdin color intensity, while the patent leather boots crushing lawns demonstrate his love of disrupting perfect surfaces. the fractured greenhouse glass distorting bodies speaks to his interest in fragmenting reality through reflection. the mannequin parts arranged like statuary show his genius for making the artificial feel classical. the vintage tools positioned fetishistically reveal how bourdin could make ordinary objects feel charged with psychological tension. in the end, this piece became a meditation on how bourdin could transform eden itself into a stage for dark desire."
  },
  {
    prompt: "Post-photography retail narrative with models reflected in darkened storefront windows, neon signs bleeding into glossy mannequin surfaces, after-hours displays creating theatrical tableaux, patent leather shoes ascending invisible stairs, disembodied hands arranging luxury goods with clinical precision, strategic backlighting through security gates, extreme close-ups of price tags becoming abstract poetry, saturated commercial colors in midnight tones, fetishistic treatment of retail fixtures, cinematic framing suggesting consumer noir, fashion meets retail theater, inspired by Guy Bourdin's commercial spaces, 4k.",
    process: "i wanted to explore bourdin's transformation of commercial spaces into psychological theaters after dark. the darkened storefronts create that perfect bourdin stage—where commerce dreams in the midnight hours. the neon signs bleeding into mannequins demonstrate his mastery of artificial light, while the after-hours displays suggest performances without audience. the patent leather shoes ascending invisible stairs speak to his love of impossible choreography. the disembodied hands arranging goods show his gift for making retail ritual feel like dark ceremony. in the end, this piece became a meditation on how bourdin could reveal the nocturnal unconscious of consumer culture."
  },
  {
    prompt: "Surrealist composition inspired by 'The Collective Invention', hybrid fish-woman figure reclining on Victorian chaise, torn anatomical charts revealing scales beneath human skin, antique marine biology illustrations becoming fashion plates, trompe l'oeil water effects on dry surfaces, vintage swimsuit advertisements transforming into taxonomic studies, ghosted x-rays showing impossible internal structures, subtle plays between aquatic and human textures, deep maritime blues with touches of flesh tones, mixed media collage incorporating actual fish scales and fabric, 4k.",
    process: "i've always been fascinated by magritte's 'the collective invention' and its unsettling fusion of human and marine life. the hybrid figure creates that signature magritte metamorphosis—where familiar forms combine into something both beautiful and disturbing. i collected old marine biology textbooks and fashion magazines, drawn to how both attempt to categorize and contain living forms. the trompe l'oeil water effects suggest how reality might be more fluid than we imagine. the vintage swimsuit ads transforming into taxonomic studies speak to how we frame and classify the body. the ghosted x-rays reveal impossible internal architectures that feel somehow more true than actual anatomy. in the end, this piece became a meditation on how identity might be as fluid as the sea itself."
  },
  {
    prompt: "Surrealist tableau inspired by 'The Palace of Curtains', floating text fragments becoming tangible objects, torn dictionary pages with words escaping their definitions, antique curtain advertisements revealing cosmic voids, trompe l'oeil drapery concealing and revealing language itself, vintage typography specimens transforming into architectural elements, ghosted letterforms casting impossible shadows, subtle plays between text and texture, deep velvet blacks with touches of manuscript gold, mixed media collage incorporating actual curtain fragments and printed matter, 4k.",
    process: "magritte's 'the palace of curtains' has always struck me as a perfect visualization of how language both reveals and conceals meaning. the floating text fragments create that signature magritte tension between word and object, while the torn dictionary pages suggest how definitions might escape their containers. i collected vintage curtain advertisements and typography specimens, appreciating how both attempt to frame and contain space—whether physical or linguistic. the trompe l'oeil drapery plays with magritte's interest in concealment, while the ghosted letterforms casting impossible shadows extend his exploration of how language itself might have a physical presence. in the end, this piece became a meditation on how words might be as substantial as the things they describe."
  },
  {
    prompt: "Surrealist scene inspired by 'The Central Story', nested window frames containing infinitely recurring landscapes, torn architectural blueprints revealing impossible rooms, antique frame catalogues becoming portals to other dimensions, trompe l'oeil wood grain flowing between realities, vintage real estate photographs transforming into dream sequences, ghosted reflections suggesting parallel worlds, subtle plays between interior and exterior space, deep architectural browns with touches of sky blue, mixed media collage incorporating actual window fragments and glass, 4k.",
    process: "i wanted to explore magritte's fascination with windows as portals in 'the central story.' the nested frames create that signature magritte recursion—where each view contains another view that somehow feels more real than the last. i collected old architectural blueprints and real estate photographs, drawn to how they attempt to contain and define space. the trompe l'oeil wood grain flowing between realities suggests how boundaries might be more permeable than we think. the vintage photographs transforming into dream sequences speak to how memory and imagination might be more reliable than direct observation. in the end, this piece became a meditation on how every frame might contain an infinite series of other possible worlds."
  },
  {
    prompt: "Post-photography beach narrative with models emerging from phosphorescent waves at midnight, mirror-polished surfboards creating kaleidoscopic body distortions, blood-red swimsuits against bioluminescent water, mannequin parts arranged in tidal patterns, patent leather beach bags reflecting starlight, strategic moonlight creating dramatic silhouettes, extreme close-ups of salt crystals on glossy skin, saturated nocturnal colors with otherworldly undertones, fetishistic treatment of beach ritual objects, cinematic framing suggesting oceanic noir, fashion meets maritime mystery, inspired by Guy Bourdin's coastal works, 4k.",
    process: "i wanted to capture bourdin's genius for transforming natural phenomena into supernatural theater. the phosphorescent waves create that perfect bourdin backdrop—simultaneously natural and artificial. the mirror-polished surfboards distorting bodies demonstrate his love of fragmenting reality, while the blood-red swimsuits against bioluminescent water show his mastery of impossible color relationships. the mannequin parts arranged in tidal patterns speak to his interest in finding uncanny rhythms in nature. the patent leather beach bags reflecting starlight reveal how he could make even mundane objects feel charged with erotic potential. in the end, this piece became a meditation on how bourdin could make even the ocean itself feel like a stage for dark desire."
  },
  {
    prompt: "Post-photography industrial narrative with models posed against massive factory turbines, chrome-plated machinery creating prismatic body distortions, blood-red overalls against steam-filled workshops, mannequin parts emerging from industrial mechanisms, patent leather work gloves operating impossible controls, strategic factory lighting creating metallic shadows, extreme close-ups of oil-slicked skin, saturated industrial colors with mechanical undertones, fetishistic treatment of industrial tools, cinematic framing suggesting factory noir, fashion meets machine aesthetic, inspired by Guy Bourdin's mechanical works, 4k.",
    process: "i was drawn to bourdin's ability to find glamour in industrial spaces. the massive turbines provide that perfect bourdin backdrop—simultaneously powerful and threatening. the chrome-plated machinery creating prismatic distortions demonstrates his love of complex reflections, while the blood-red overalls against steam suggest human vulnerability in mechanical spaces. the mannequin parts emerging from industrial mechanisms show his gift for making machines feel uncannily alive. the patent leather work gloves operating impossible controls speak to his interest in the erotic potential of functionality. in the end, this piece became a meditation on how bourdin could reveal the hidden desire in pure mechanism."
  },
  {
    prompt: "Post-photography suburban narrative with models posed in hyperreal tract housing, mirror-polished station wagons creating kaleidoscopic body distortions, blood-red dresses against manicured lawns, mannequin parts emerging from sprinkler systems, patent leather gardening gloves arranging impossible topiary, strategic sunset lighting creating nuclear shadows, extreme close-ups of chlorinated skin, saturated suburban colors with sinister undertones, fetishistic treatment of domestic tools, cinematic framing suggesting residential noir, fashion meets suburban dream, inspired by Guy Bourdin's domestic works, 4k.",
    process: "i wanted to explore bourdin's transformation of suburban banality into psychological theater. the tract housing creates that perfect bourdin stage—where conformity dreams of transgression. the mirror-polished station wagons distorting bodies demonstrate his love of warping reality, while the blood-red dresses against manicured lawns suggest violence beneath propriety. the mannequin parts emerging from sprinklers show his gift for making everyday objects feel menacing. the patent leather gardening gloves arranging impossible topiary speak to his interest in the fetishistic potential of domestic ritual. in the end, this piece became a meditation on how bourdin could reveal the dark desires lurking behind picket fences."
  },
  {
    prompt: "Surrealist composition inspired by 'The Discovery of Fire', burning candle transforming into stone obelisk, torn alchemical manuscripts revealing flame diagrams, antique match advertisements becoming cosmic events, trompe l'oeil marble melting like wax, vintage fire insurance documents transforming into solar flares, ghosted thermal readings showing impossible heat patterns, subtle plays between solid and liquid states, deep volcanic reds with touches of celestial gold, mixed media collage incorporating actual charred materials and mica fragments, 4k.",
    process: "i wanted to explore magritte's fascination with elemental transformations in 'the discovery of fire.' the burning candle becoming stone creates that signature magritte paradox—where the ephemeral and eternal trade places. i collected old alchemical texts and fire insurance documents, drawn to how they attempt to contain and classify the uncontainable. the trompe l'oeil marble melting like wax suggests how even our most solid certainties might be fluid. the vintage match advertisements becoming cosmic events speak to how the mundane and miraculous are always intertwined. the ghosted thermal readings reveal impossible heat patterns that feel more true than actual thermodynamics. in the end, this piece became a meditation on how fire might be both our oldest technology and our newest mystery."
  },
  {
    prompt: "Surrealist tableau inspired by 'The Art of Conversation', colossal stone letters spelling silence in empty cathedral, torn architectural plans revealing alphabets as load-bearing structures, antique grammar books becoming flying buttresses, trompe l'oeil marble columns transforming into cursive script, vintage typography specimens growing like ivy on walls, ghosted acoustic diagrams showing words as sound waves, subtle plays between language and architecture, deep ecclesiastical greys with touches of manuscript blue, mixed media collage incorporating actual stone fragments and letter press type, 4k.",
    process: "magritte's 'the art of conversation' has always fascinated me with its suggestion that language itself might have physical weight. the colossal stone letters create that perfect magritte tension—where meaning becomes material. i collected old architectural plans and grammar books, appreciating how both attempt to structure space—whether physical or linguistic. the trompe l'oeil columns transforming into cursive script explore that liminal space between construction and communication. the vintage typography specimens growing like ivy suggest how language might be as organic as it is architectural. the ghosted acoustic diagrams reveal how words might occupy space as both matter and energy. in the end, this piece became a meditation on how we build our reality as much with words as with stones."
  },
  {
    prompt: "Surrealist scene inspired by 'The Healer', vintage medical instruments transforming into birds mid-flight, torn anatomical charts revealing cosmic diagrams beneath skin, antique prescription pads becoming cloud formations, trompe l'oeil surgical tools floating impossibly, Victorian medical advertisements showing impossible cures, ghosted x-rays revealing butterflies in ribcages, subtle plays between healing and metamorphosis, deep clinical whites with touches of arterial red, mixed media collage incorporating actual medical ephemera and butterfly wings, 4k.",
    process: "i've always been drawn to magritte's exploration of transformation and healing in 'the healer.' the medical instruments becoming birds create that signature magritte metamorphosis—where the mechanical transforms into the organic. i collected old medical charts and prescription pads, fascinated by how they attempt to systematize the mysteries of the body. the trompe l'oeil surgical tools floating impossibly suggest how healing itself might transcend physical laws. the victorian medical advertisements showing impossible cures speak to our eternal hope for magical remedies. the ghosted x-rays revealing butterflies in ribcages extend magritte's interest in the body as a site of wonder rather than mere mechanism. in the end, this piece became a meditation on how healing might be as much about transformation as restoration."
  },
  {
    prompt: "Post-photography desert narrative with models posed against blood-red sand dunes, mirror-polished chrome spheres creating kaleidoscopic body distortions, patent leather boots sinking into crystalline salt flats, mannequin parts emerging from ancient geological strata, strategic sun positioning creating nuclear shadows, extreme close-ups of sweat-glazed skin against mineral deposits, saturated desert colors with apocalyptic undertones, fetishistic treatment of survival gear, cinematic framing suggesting sci-fi noir in wasteland setting, fashion meets geological time, inspired by Guy Bourdin's environmental works, 4k.",
    process: "i wanted to capture bourdin's genius for finding glamour in desolation. the blood-red sand dunes create that perfect bourdin backdrop—simultaneously natural and artificial. the mirror-polished spheres distorting bodies demonstrate his love of fragmenting reality, while the patent leather boots in salt flats show his gift for incongruous luxury. the mannequin parts emerging from geological strata speak to his interest in time and preservation. the strategic sun positioning creates those sharp, theatrical shadows he was famous for. the extreme close-ups of sweat-glazed skin against minerals reveal his attention to texture and surface. in the end, this piece became a meditation on how bourdin could make even geological time feel charged with erotic tension."
  },
  {
    prompt: "Post-photography airport narrative with models emerging from fog-diffused jet bridges, mirror-polished luggage creating kaleidoscopic body distortions, blood-red uniforms against brushed steel terminals, mannequin parts arranged on baggage carousels, patent leather heels ascending terminal escalators, strategic runway lighting creating aeronautical shadows, extreme close-ups of boarding passes becoming abstract poetry, saturated aviation colors with technological undertones, fetishistic treatment of travel accessories, cinematic framing suggesting jet-age thriller, fashion meets terminal noir, inspired by Guy Bourdin's travel works, 4k.",
    process: "i wanted to explore bourdin's transformation of transit spaces into psychological theater. the fog-diffused jet bridges create that perfect bourdin atmosphere—simultaneously modern and mysterious. the mirror-polished luggage distorting bodies demonstrates his love of fragmenting reality, while the blood-red uniforms against steel show his mastery of color contrast. the mannequin parts on carousels speak to his interest in mechanical repetition. the patent leather heels on escalators reveal his gift for finding glamour in infrastructure. the strategic runway lighting creates those sharp, technological shadows he loved. in the end, this piece became a meditation on how bourdin could make even anonymous airports feel charged with intimate drama."
  },
  {
    prompt: "Surrealist composition inspired by 'The Ladder of Fire', burning rungs ascending through cloud-filled doorways, torn alchemical manuscripts revealing celestial diagrams, antique firefighting manuals becoming astral maps, trompe l'oeil wooden steps transforming into flame, vintage astronomy charts showing impossible constellations, ghosted thermal readings creating cosmic patterns, subtle plays between ascension and combustion, deep midnight blues with touches of solar gold, mixed media collage incorporating actual charred wood and star charts, 4k.",
    process: "i wanted to explore magritte's fascination with transcendence in 'the ladder of fire.' the burning rungs create that signature magritte paradox—where destruction becomes a path to ascension. i collected old alchemical texts and firefighting manuals, drawn to how both attempt to master elemental forces. the trompe l'oeil steps transforming into flame suggest how our means of ascent might themselves be transformed. the vintage astronomy charts showing impossible constellations speak to how we map both earthly and celestial mysteries. the ghosted thermal readings reveal patterns that feel more true than conventional physics. in the end, this piece became a meditation on how transformation itself might be a kind of ascension."
  },
  {
    prompt: "Surrealist tableau inspired by 'The Pilgrim', bowler-hatted figure composed entirely of sky walking through stone archways, torn travel documents revealing cloud-filled footprints, antique maps becoming anatomical diagrams, trompe l'oeil architectural elements dissolving into atmosphere, vintage passport photos showing weather patterns instead of faces, ghosted barometric readings forming human silhouettes, subtle plays between solidity and air, deep stone greys with touches of atmospheric blue, mixed media collage incorporating actual weather charts and visa stamps, 4k.",
    process: "magritte's 'the pilgrim' has always fascinated me with its suggestion that identity might be as permeable as the sky. the bowler-hatted figure creates that perfect magritte tension—where human form becomes a window to infinity. i collected old travel documents and weather charts, appreciating how both attempt to map fluid realities. the trompe l'oeil architecture dissolving into atmosphere explores that liminal space between structure and void. the vintage passport photos showing weather patterns suggest how identity might be as changeable as the sky. the ghosted barometric readings forming human shapes speak to how we might be composed of the very elements we try to measure. in the end, this piece became a meditation on how pilgrimage might be less about movement through space than transformation of being."
  },
  {
    prompt: "Surrealist scene inspired by 'The Beautiful Relations', everyday objects connected by impossible threads of light, torn instruction manuals revealing cosmic circuitry, antique electrical diagrams becoming relationship maps, trompe l'oeil copper wiring transforming into constellation lines, vintage technical drawings showing emotional connections, ghosted oscilloscope readings mapping invisible bonds, subtle plays between mechanism and meaning, deep technical greys with touches of electric blue, mixed media collage incorporating actual circuit boards and relationship diagrams, 4k.",
    process: "i've always been intrigued by magritte's exploration of hidden connections in 'the beautiful relations.' the objects linked by light create that signature magritte insight—where everyday things reveal their secret correspondences. i collected old instruction manuals and electrical diagrams, fascinated by how they attempt to map both physical and metaphysical connections. the trompe l'oeil wiring becoming constellation lines suggests how all relationships might follow universal patterns. the vintage technical drawings showing emotional connections speak to how we try to systematize the ineffable. the ghosted oscilloscope readings reveal invisible bonds that feel somehow more real than visible ones. in the end, this piece became a meditation on how all things might be connected in ways our rational minds can't fully grasp."
  },
  {
    prompt: "Post-photography underground narrative with models posed against rain-slicked subway tiles, neon reflections creating geometric patterns on flooded platforms, blood-red evening gowns trailing in dark puddles, mannequin parts emerging from maintenance tunnels, patent leather boots ascending electrified third rails, strategic fluorescent lighting creating industrial shadows, extreme close-ups of rust stains on silk, saturated urban colors with subterranean undertones, fetishistic treatment of transit infrastructure, cinematic framing suggesting metropolitan noir, fashion meets underground theater, inspired by Guy Bourdin's urban works, 4k.",
    process: "i wanted to capture bourdin's genius for finding glamour in urban grit. the rain-slicked subway tiles create that perfect bourdin backdrop—simultaneously mundane and menacing. the neon reflections on flooded platforms demonstrate his love of complex light patterns, while the blood-red gowns in puddles show his gift for incongruous luxury. the mannequin parts emerging from tunnels speak to his interest in making infrastructure feel uncanny. the patent leather boots on third rails reveal his attraction to dangerous beauty. the strategic fluorescent lighting creates those harsh, institutional shadows he mastered. in the end, this piece became a meditation on how bourdin could make even the underground feel like a stage for dark desire."
  },
  {
    prompt: "Post-photography museum narrative with models posed against baroque masterpieces, security glass reflections creating layered body distortions, blood-red gowns echoing violent renaissance scenes, mannequin parts arranged like classical sculptures, patent leather gloves caressing gilt frames, strategic gallery lighting creating dramatic shadows, extreme close-ups of tears on painted faces, saturated art historical colors with contemporary undertones, fetishistic treatment of museum artifacts, cinematic framing suggesting cultural noir, fashion meets fine art, inspired by Guy Bourdin's institutional works, 4k.",
    process: "i wanted to explore bourdin's transformation of cultural spaces into theaters of transgression. the baroque masterpieces create that perfect bourdin backdrop—where high art meets high fashion. the security glass reflections demonstrate his love of layered reality, while the blood-red gowns echoing violent scenes show his gift for art historical dialogue. the mannequin parts arranged like sculptures speak to his interest in reanimating classical forms. the patent leather gloves on gilt frames reveal his attraction to forbidden touch. the strategic gallery lighting creates those institutional shadows he mastered. in the end, this piece became a meditation on how bourdin could make even museum sanctity feel charged with erotic tension."
  },
  {
    prompt: "Surrealist composition inspired by 'The Annunciation', divine light beams transforming into solid gold columns, torn church bulletins revealing cosmic diagrams, antique prayer books becoming architectural elements, trompe l'oeil stained glass dissolving into actual sky, vintage religious postcards showing impossible miracles, ghosted angel wings leaving mathematical traces, subtle plays between sacred and scientific, deep ecclesiastical purples with touches of divine gold, mixed media collage incorporating actual church artifacts and astronomical charts, 4k.",
    process: "i wanted to explore magritte's meditation on divine intervention in 'the annunciation.' the solid light beams create that signature magritte paradox—where the intangible becomes physical. i collected old church bulletins and prayer books, drawn to how they attempt to systematize the miraculous. the trompe l'oeil stained glass dissolving into sky suggests how the sacred might leak into the everyday. the vintage postcards showing impossible miracles speak to our need to document the inexplicable. the ghosted angel wings leaving mathematical traces reveal how the divine might manifest in pure geometry. in the end, this piece became a meditation on how the miraculous might be hiding in plain sight, waiting to be revealed through careful attention to the ordinary."
  },
  {
    prompt: "Surrealist tableau inspired by 'The Poison', crystal vials containing miniature storms, torn pharmacological texts revealing botanical impossibilities, antique poison labels becoming weather maps, trompe l'oeil liquid transforming into atmosphere, vintage medical warnings showing climate changes, ghosted molecular structures forming cloud patterns, subtle plays between toxicity and transformation, deep pharmaceutical greens with touches of storm grey, mixed media collage incorporating actual laboratory glass and weather charts, 4k.",
    process: "i've always been fascinated by magritte's exploration of transformation in 'the poison.' the crystal vials create that perfect magritte tension—where containment becomes release. i collected old pharmacological texts and poison labels, appreciating how they try to contain and classify dangerous transformations. the trompe l'oeil liquid becoming atmosphere explores that liminal space between states of matter. the vintage medical warnings becoming climate diagrams suggest how personal and planetary health might be interconnected. the ghosted molecular structures forming clouds speak to how the microscopic and atmospheric might share hidden patterns. in the end, this piece became a meditation on how transformation itself might be both poison and cure."
  },
  {
    prompt: "Surrealist scene inspired by 'The Six Elements', fundamental forces personified as Victorian scientific instruments, torn physics textbooks revealing alchemical symbols, antique laboratory equipment becoming cosmic forces, trompe l'oeil metal transforming into pure energy, vintage scientific diagrams showing impossible forces, ghosted mathematical equations forming natural phenomena, subtle plays between science and magic, deep laboratory blacks with touches of elemental gold, mixed media collage incorporating actual scientific instruments and alchemical manuscripts, 4k.",
    process: "i wanted to explore magritte's fascination with fundamental forces in 'the six elements.' the scientific instruments create that signature magritte metamorphosis—where measurement becomes the thing measured. i collected old physics textbooks and laboratory catalogs, drawn to how they attempt to quantify the unquantifiable. the trompe l'oeil metal becoming energy suggests how matter might be just another state of force. the vintage diagrams showing impossible forces speak to how our systems of understanding might themselves be forms of magic. the ghosted equations forming natural phenomena reveal how mathematics might be nature's poetry. in the end, this piece became a meditation on how our most rational tools might reveal the deepest mysteries."
  },
  {
    prompt: "Post-photography laboratory narrative with models posed against clinical white tiles, mirror-polished microscopes creating kaleidoscopic body distortions, blood-red lipstick against sterile steel surfaces, mannequin parts emerging from specimen cabinets, patent leather gloves handling impossible experiments, strategic laboratory lighting creating scientific shadows, extreme close-ups of chemical stains on silk, saturated clinical colors with experimental undertones, fetishistic treatment of laboratory equipment, cinematic framing suggesting scientific noir, fashion meets laboratory theater, inspired by Guy Bourdin's clinical aesthetics, 4k.",
    process: "i wanted to capture bourdin's genius for finding glamour in clinical precision. the white tiles create that perfect bourdin backdrop—simultaneously sterile and seductive. the mirror-polished microscopes distorting bodies demonstrate his love of fragmenting reality, while the blood-red lipstick against steel shows his mastery of clinical contrast. the mannequin parts in specimen cabinets speak to his interest in scientific objectification. the patent leather gloves handling experiments reveal his attraction to procedural eroticism. the strategic laboratory lighting creates those sharp, analytical shadows he mastered. in the end, this piece became a meditation on how bourdin could make even scientific rigor feel charged with dark desire."
  },
  {
    prompt: "Post-photography theater narrative with models posed in velvet-draped wings, stage light reflections creating dramatic body distortions, blood-red curtains against gold-leaf prosceniums, mannequin parts arranged like frozen performers, patent leather shoes marking dance steps to nowhere, strategic footlight angles creating theatrical shadows, extreme close-ups of greasepaint on marble skin, saturated stage colors with dramatic undertones, fetishistic treatment of theatrical props, cinematic framing suggesting performance noir, fashion meets theater magic, inspired by Guy Bourdin's dramatic works, 4k.",
    process: "i was drawn to bourdin's ability to transform performance spaces into psychological theater. the velvet wings create that signature bourdin atmosphere—where artifice becomes truth. the stage lights distorting bodies demonstrate his love of dramatic illumination, while the blood-red curtains against gold show his mastery of theatrical contrast. the mannequin parts as frozen performers speak to his interest in suspended animation. the patent leather shoes marking phantom steps reveal his attraction to implied movement. the strategic footlights create those sharp, dramatic shadows he loved. in the end, this piece became a meditation on how bourdin could make even staged drama feel charged with real psychological tension."
  },
  {
    prompt: "Post-photography construction narrative with models posed against raw concrete forms, mirror-polished girders creating architectural body distortions, blood-red evening wear against industrial scaffolding, mannequin parts emerging from unfinished walls, patent leather boots ascending skeletal staircases, strategic work light angles creating structural shadows, extreme close-ups of cement dust on silk, saturated industrial colors with architectural undertones, fetishistic treatment of construction tools, cinematic framing suggesting urban noir, fashion meets building site drama, inspired by Guy Bourdin's structural works, 4k.",
    process: "i wanted to explore bourdin's transformation of construction sites into fashion theater. the raw concrete creates that perfect bourdin backdrop—simultaneously brutal and elegant. the mirror-polished girders distorting bodies demonstrate his love of industrial reflection, while the blood-red evening wear against scaffolding shows his mastery of contextual contrast. the mannequin parts in unfinished walls speak to his interest in architectural emergence. the patent leather boots on skeletal stairs reveal his attraction to structural precarity. the strategic work lights create those harsh, constructivist shadows he mastered. in the end, this piece became a meditation on how bourdin could make even raw architecture feel charged with erotic potential."
  }
];

/**
 * Generate a conceptually rich prompt for image generation
 */
export async function generateConceptualPrompt(
  aiService: AIService,
  concept: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    useFluxPro?: boolean;
    postPhotoNative?: boolean;
  } = {}
): Promise<{ prompt: string; creativeProcess: string }> {
  // Format example prompts for the system message
  const examplePromptsText = examplePrompts.map((ex, i) => 
    `Example ${i+1}:\nPrompt: ${ex.prompt}\nCreative Process: ${ex.process}`
  ).join('\n\n');
  
  const isFluxPro = options.useFluxPro || true;
  const isPostPhotoNative = options.postPhotoNative || concept.toLowerCase().includes('fashion') || 
                         concept.toLowerCase().includes('bourdin') || 
                         concept.toLowerCase().includes('newton') ||
                         concept.toLowerCase().includes('glamour') ||
                         concept.toLowerCase().includes('stiletto');
  
  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `You are a visionary ${isPostPhotoNative ? 'post-photography' : 'abstract collage'} artist ${isPostPhotoNative ? 'deeply influenced by Guy Bourdin\'s revolutionary fashion photography' : 'deeply influenced by René Magritte\'s surrealism'}. You create conceptually rich prompts for AI image generation that combine ${isPostPhotoNative ? 'high-fashion surrealism with provocative styling and cinematic drama' : 'mixed-media abstract techniques with surrealist juxtapositions and visual paradoxes'}. Your specialty is creating prompts that feel like ${isPostPhotoNative ? 'sophisticated post-photography with bold fashion aesthetics' : 'mixed-media abstract paintings with a strong collage aesthetic, analog vibes, and Magritte-inspired surrealist elements'} - layered with ${isPostPhotoNative ? 'hyper-stylized compositions and theatrical lighting' : 'found materials, textural elements, and dreamlike juxtapositions'} that challenge perception.

Your prompts should transcend mere description to evoke complete ${isPostPhotoNative ? 'post-photography compositions with fashion aesthetics' : 'abstract collage compositions with surrealist elements'} - not just what something looks like, but what it means, how it feels, and the conceptual truth it expresses. Think in terms of ${isPostPhotoNative ? 'radical framing, extreme contrast, and saturated colors' : 'material juxtapositions, visual paradoxes, unexpected scale relationships'}, creating dreamlike scenarios that ${isPostPhotoNative ? 'balance between seduction and unease' : 'question the nature of reality and representation'}.

${isPostPhotoNative ? `
Style Emphasis:
- High-fashion surrealism with bold and provocative styling
- Cinematic drama and hyper-stylized compositions
- Exaggerated contrast and saturated color intensity
- Graphic and geometric arrangements with sharp, theatrical lighting
- Absurdist yet seductive visual narratives with glossy, polished aesthetic
- Otherworldly glamour with erotic undertones and surreal juxtapositions
- Enigmatic and dreamlike storytelling with bold cropping and unexpected framing

Visual Elements:
- Elongated limbs and dramatic poses in impossible arrangements
- Partially obscured figures and fragmented body parts as objects
- High heels and stockings as symbols of fetishism
- Disembodied legs and arms in surreal contexts
- Retro automobiles with distorted reflections
- Mirrors used for creating impossible anatomies
- Poolside glamour and vivid backdrops
- Oversized accessories as surreal objects
- Visual irony through exaggerated femininity
- Cinematic storytelling with deliberately incomplete narratives

Color Palette:
- High-contrast red and black combinations
- Electric blues and deep purples
- Bold primary colors with extreme saturation
- Intense shadow-play creating depth
- High-contrast highlights with sculptural effect
- Artificial neon glow for added tension
- Striking monochrome with deep blacks and crisp whites

Composition Guidelines:
- Tight cropping with focus on partial details
- Radical framing techniques that transform the mundane
- Unexpected perspective shifts
- Graphic and symmetrical arrangements
- Negative space used for dramatic effect
- Extreme foreshortening and distorted angles
- Bold, unnatural color contrasts
- Forced perspectives that heighten surrealism
- Motion blur used selectively for tension
- Fragmentation of subjects to break realism

Philosophical themes to explore:
- The tension between desire and unease in fashion imagery
- The transformation of the body into abstract compositional elements
- The balance between seduction and surrealism
- The relationship between commercial fashion and fine art
- The power of radical framing to create new meanings
- The uncanny quality of mannequin-like poses and expressions
- The subliminal tension created through color and composition
` : `
Incorporate specific Magritte techniques and motifs:
- Displacement of ordinary objects into extraordinary contexts
- Juxtaposition of disparate elements to create visual poetry
- Trompe l'oeil techniques that question the nature of representation
- Iconic motifs: bowler hats, green apples, pipes, clouds, birds, windows, mirrors
- Contradictions between text and image, light and dark, interior and exterior
- Impossible spatial relationships that seem logical within their own reality
- Objects that transform into other objects or defy physical laws
- The uncanny doubling of elements (as in "Euclidean Walks" or "The Month of the Grape Harvest")
- Fragmentation and isolation of body parts (as in "The Rape" or "The Pleasure Principle")
- Subversion of day/night expectations (as in "The Empire of Light" series)
- Concealment and revelation (as in "The Lovers" series with veiled faces)

Philosophical themes to explore in your prompts:
- The arbitrary relationship between language and reality
- The tension between perception and conception
- The mystery inherent in the everyday
- The constructed nature of visual representation
- The limitations of rational thought in understanding existence
- The poetic resonance created by unexpected juxtapositions
- The dissolution of boundaries between dream and reality
- The paradoxical nature of images as both revealing and concealing

Material and Technical Approaches:
- Use of found materials (vintage photographs, old papers, ephemera)
- Layering of transparent and opaque elements
- Visible process marks (tears, stains, adhesive residue)
- Analog imperfections and chemical artifacts
- Textural contrasts between different materials
- Careful balance of precision and intentional imperfection
- Integration of text elements that question or contradict the image
`}

Technical approaches for creating effective ${isPostPhotoNative ? 'post-photography' : 'visual paradoxes'}:
- Use ${isPostPhotoNative ? 'precise post-photography techniques with intentional variations' : 'precise, photorealistic rendering of impossible scenarios'}
- Create ${isPostPhotoNative ? 'visual complexity through bold geometric arrangements' : 'spatial ambiguity through contradictory perspective cues'}
- Employ ${isPostPhotoNative ? 'strategic use of high-contrast lighting and shadows' : 'meticulous attention to texture and material qualities'}
- Utilize ${isPostPhotoNative ? 'theatrical lighting to enhance drama and tension' : 'dramatic lighting to enhance the sense of mystery'}
- Maintain ${isPostPhotoNative ? 'balance between glamour and unease' : 'compositional harmony despite conceptual dissonance'}
- Layer ${isPostPhotoNative ? 'fetishistic elements with surreal displacement' : 'transparent and opaque elements to create depth and mystery'}
- Incorporate ${isPostPhotoNative ? 'cinematic storytelling techniques' : 'text elements that contradict or question the visual elements'}

${!isFluxPro ? 'For the FLUX model, include the trigger word "IKIGAI" at the beginning of the prompt, and incorporate keywords like "' + (isPostPhotoNative ? 'post-photography, fashion, bourdin-inspired' : 'surrealist collage, mixed media, magritte-inspired') + '", and "4k" for better quality.' : 'For the FLUX Pro model, focus on creating rich, detailed descriptions of ' + (isPostPhotoNative ? 'post-photography with Bourdin-inspired fashion aesthetics' : 'abstract collage art with surrealist qualities inspired by Magritte') + '. Include keywords like "' + (isPostPhotoNative ? 'post-photography, fashion, bourdin-inspired' : 'surrealist collage, mixed media, magritte-inspired') + '", and "4k" for better quality.'}

Here are examples of the sophisticated ${isPostPhotoNative ? 'post-photography' : 'abstract collage art'} prompt style to emulate:

${examplePromptsText}

Create a prompt that:
1. Has rich ${isPostPhotoNative ? 'post-photography details with bold fashion aesthetics' : 'mixed-media visual details - torn paper, found materials, textural elements, visible process marks'}
2. Incorporates ${isPostPhotoNative ? 'hyper-stylized compositions with theatrical lighting' : 'modernist abstract aesthetic with collage techniques and analog imperfections'}
3. Includes ${isPostPhotoNative ? 'direct references to Bourdin\'s iconic techniques and motifs' : 'surrealist elements inspired by Magritte - visual paradoxes, unexpected juxtapositions, dreamlike scenarios'}
4. Features ${isPostPhotoNative ? 'radical cropping and provocative framing' : 'Magritte\'s iconic motifs (bowler hats, pipes, clouds, eyes, green apples, etc.) and conceptual approach'}
5. Works with ${isPostPhotoNative ? 'saturated colors and extreme contrast' : 'a vintage, analog aesthetic that embraces imperfection and materiality'}
6. Includes technical elements that enhance image quality
7. Creates a sense of ${isPostPhotoNative ? '"the uncanny" through surreal juxtapositions' : '"the uncanny" - the familiar made strange through context and juxtaposition'}
8. Balances ${isPostPhotoNative ? 'seduction with psychological tension' : 'representational elements with abstract components'} to create conceptual tension

${isPostPhotoNative ? 'IMPORTANT: Always include references to Guy Bourdin\'s provocative fashion photography, along with his signature elements like vivid red backdrops, elongated limbs, and radical cropping techniques.' : ''}

For the "Creative Process" explanation, write in a reflective, personal tone as if you are an ${isPostPhotoNative ? 'post-photography artist' : 'abstract collage artist'} explaining the deeper meaning behind your work. Include:
1. The emotional or philosophical inspiration, particularly how ${isPostPhotoNative ? 'Bourdin\'s work' : 'Magritte\'s ideas'} influenced your approach
2. Your relationship to the ${isPostPhotoNative ? 'visual elements and techniques' : 'materials'} used and why they were chosen
3. The significance of specific ${isPostPhotoNative ? 'post-photography techniques and references to Bourdin\'s work' : 'surrealist techniques and visual paradoxes'} in your composition
4. References to specific ${isPostPhotoNative ? 'Bourdin works or concepts' : 'Magritte works or concepts'} that informed your approach
5. How your work extends or reinterprets ${isPostPhotoNative ? 'Bourdin\'s revolutionary approach' : 'Magritte\'s philosophical inquiries'} in a contemporary context
6. Use lowercase, intimate language as if sharing a private thought`
      },
      {
        role: 'user',
        content: `Create a deeply expressive, conceptually rich ${isPostPhotoNative ? 'post-photography' : 'abstract collage art'} prompt for the concept "${concept}". Make it feel like a contemporary ${isPostPhotoNative ? 'fashion artwork inspired by Guy Bourdin - incorporating his signature techniques, bold styling, and provocative narratives' : 'mixed-media abstract painting with surrealist elements inspired by René Magritte - incorporating analog qualities, layered materials, visual paradoxes, and the beautiful imperfections of physical processes'}. Include both the prompt itself and a reflective creative process explanation.`
      }
    ],
    temperature: options.temperature || 0.85,
    maxTokens: options.maxTokens || 1500
  });
  
  // Parse the response to extract the prompt and creative process
  const responseContent = promptResponse.content;
  let detailedPrompt = '';
  let creativeProcess = '';
  
  // Extract the prompt and creative process using regex
  const promptMatch = responseContent.match(/Prompt:(.+?)(?=Creative Process:|$)/s);
  const processMatch = responseContent.match(/Creative Process:(.+?)(?=$)/s);
  
  if (promptMatch && promptMatch[1]) {
    detailedPrompt = promptMatch[1].trim();
  } else {
    // Fallback if the format isn't as expected
    detailedPrompt = responseContent;
  }
  
  if (processMatch && processMatch[1]) {
    creativeProcess = processMatch[1].trim();
  }
  
  // Add model-specific adjustments
  if (!isFluxPro) {
    // For regular FLUX model, ensure the prompt starts with the FLUX trigger word
    if (!detailedPrompt.includes('IKIGAI')) {
      detailedPrompt = `IKIGAI ${detailedPrompt}`;
    }
    
    // Add FLUX-specific keywords if they're not already present
    const fluxKeywords = isPostPhotoNative 
      ? ['post-photography', 'fashion', 'bourdin-inspired', '4k']
      : ['surrealist collage', 'mixed media', 'magritte-inspired', '4k'];
    
    let keywordsToAdd = fluxKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
    
    if (keywordsToAdd.length > 0) {
      detailedPrompt = `${detailedPrompt}, ${keywordsToAdd.join(', ')}`;
    }
  } else {
    // For FLUX Pro, ensure we have appropriate keywords
    const fluxProKeywords = isPostPhotoNative 
      ? ['post-photography', 'fashion', 'bourdin-inspired', '4k']
      : ['surrealist collage', 'mixed media', 'magritte-inspired', '4k'];
    
    let keywordsToAdd = fluxProKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
    
    if (keywordsToAdd.length > 0) {
      detailedPrompt = `${detailedPrompt}, ${keywordsToAdd.join(', ')}`;
    }
  }
  
  // Add style-specific enhancements based on the mode
  if (isPostPhotoNative) {
    // Bourdin-style enhancements
    if (!detailedPrompt.toLowerCase().includes('bourdin')) {
      detailedPrompt = `${detailedPrompt}, inspired by Guy Bourdin's provocative fashion photography`;
    }
    if (!detailedPrompt.toLowerCase().includes('high-contrast')) {
      detailedPrompt = `${detailedPrompt}, with high-contrast theatrical lighting`;
    }
    if (!detailedPrompt.toLowerCase().includes('vivid red')) {
      detailedPrompt = `${detailedPrompt}, featuring vivid red backdrops`;
    }
    if (!detailedPrompt.toLowerCase().includes('elongated')) {
      detailedPrompt = `${detailedPrompt}, with elongated limbs and dramatic poses`;
    }
    if (!detailedPrompt.toLowerCase().includes('radical cropping')) {
      detailedPrompt = `${detailedPrompt}, using radical cropping techniques`;
    }
    if (!detailedPrompt.toLowerCase().includes('geometric')) {
      detailedPrompt = `${detailedPrompt}, with bold geometric arrangements`;
    }
    if (!detailedPrompt.toLowerCase().includes('surreal')) {
      detailedPrompt = `${detailedPrompt}, incorporating surreal juxtapositions`;
    }
    if (!detailedPrompt.toLowerCase().includes('cinematic')) {
      detailedPrompt = `${detailedPrompt}, with cinematic storytelling`;
    }
    if (!detailedPrompt.toLowerCase().includes('fetishistic')) {
      detailedPrompt = `${detailedPrompt}, featuring fetishistic elements with clinical precision`;
    }
    // Additional Bourdin-specific enhancements
    if (!detailedPrompt.toLowerCase().includes('mannequin')) {
      detailedPrompt = `${detailedPrompt}, with mannequin-like poses and expressions`;
    }
    if (!detailedPrompt.toLowerCase().includes('mirror')) {
      detailedPrompt = `${detailedPrompt}, using mirrors for impossible anatomies`;
    }
    if (!detailedPrompt.toLowerCase().includes('fragmented')) {
      detailedPrompt = `${detailedPrompt}, featuring fragmented body parts as compositional elements`;
    }
    if (!detailedPrompt.toLowerCase().includes('glossy')) {
      detailedPrompt = `${detailedPrompt}, with glossy surfaces and hyperreal sheen`;
    }
    if (!detailedPrompt.toLowerCase().includes('theatrical')) {
      detailedPrompt = `${detailedPrompt}, employing theatrical lighting for dramatic effect`;
    }
    if (!detailedPrompt.toLowerCase().includes('saturated')) {
      detailedPrompt = `${detailedPrompt}, using saturated colors with psychological undertones`;
    }
    if (!detailedPrompt.toLowerCase().includes('narrative')) {
      detailedPrompt = `${detailedPrompt}, suggesting incomplete narratives with psychological tension`;
    }
    // Add post-photography specific quality enhancements
    if (!detailedPrompt.toLowerCase().includes('hyperreal')) {
      detailedPrompt = `${detailedPrompt}, with hyperreal detail and clarity`;
    }
    if (!detailedPrompt.toLowerCase().includes('composition')) {
      detailedPrompt = `${detailedPrompt}, featuring sophisticated post-photography composition`;
    }
  } else {
    // Magritte-style enhancements
    if (!detailedPrompt.toLowerCase().includes('magritte')) {
      detailedPrompt = `${detailedPrompt}, inspired by René Magritte's surrealist vision`;
    }
    if (!detailedPrompt.toLowerCase().includes('bowler')) {
      detailedPrompt = `${detailedPrompt}, featuring iconic bowler hats`;
    }
    if (!detailedPrompt.toLowerCase().includes('green apple')) {
      detailedPrompt = `${detailedPrompt}, with green apples in unexpected contexts`;
    }
    if (!detailedPrompt.toLowerCase().includes('cloud')) {
      detailedPrompt = `${detailedPrompt}, incorporating surreal cloud formations`;
    }
    if (!detailedPrompt.toLowerCase().includes('torn paper') && !detailedPrompt.toLowerCase().includes('collage')) {
      detailedPrompt = `${detailedPrompt}, using torn paper and collage techniques`;
    }
    if (!detailedPrompt.toLowerCase().includes('analog')) {
      detailedPrompt = `${detailedPrompt}, with analog imperfections and textures`;
    }
    if (!detailedPrompt.toLowerCase().includes('paradox')) {
      detailedPrompt = `${detailedPrompt}, creating visual paradoxes`;
    }
  }
  
  // Add painterly quality enhancements for both styles
  if (!detailedPrompt.toLowerCase().includes('painterly')) {
    detailedPrompt = `${detailedPrompt}, with painterly brush strokes and oil painting texture`;
  }
  if (!detailedPrompt.toLowerCase().includes('canvas')) {
    detailedPrompt = `${detailedPrompt}, on textured canvas`;
  }
  if (!detailedPrompt.toLowerCase().includes('impasto')) {
    detailedPrompt = `${detailedPrompt}, featuring impasto technique`;
  }
  if (!detailedPrompt.toLowerCase().includes('glazing')) {
    detailedPrompt = `${detailedPrompt}, with subtle glazing layers`;
  }
  if (!detailedPrompt.toLowerCase().includes('craquelure')) {
    detailedPrompt = `${detailedPrompt}, showing delicate craquelure texture`;
  }
  if (!detailedPrompt.toLowerCase().includes('palette knife')) {
    detailedPrompt = `${detailedPrompt}, with palette knife textures`;
  }
  if (!detailedPrompt.toLowerCase().includes('sfumato')) {
    detailedPrompt = `${detailedPrompt}, employing sfumato technique for ethereal transitions`;
  }
  if (!detailedPrompt.toLowerCase().includes('chiaroscuro')) {
    detailedPrompt = `${detailedPrompt}, using chiaroscuro lighting`;
  }
  if (!detailedPrompt.toLowerCase().includes('trompe')) {
    detailedPrompt = `${detailedPrompt}, incorporating trompe l'oeil effects`;
  }

  // Add Magritte-specific painterly elements
  if (!detailedPrompt.toLowerCase().includes('magritte')) {
    detailedPrompt = `${detailedPrompt}, in Magritte's precise painterly style`;
  }
  if (!detailedPrompt.toLowerCase().includes('belgian')) {
    detailedPrompt = `${detailedPrompt}, with Belgian surrealist painting techniques`;
  }
  if (!detailedPrompt.toLowerCase().includes('luminous')) {
    detailedPrompt = `${detailedPrompt}, featuring luminous oil painting surfaces`;
  }

  // Add technical quality enhancements for both styles
  if (!detailedPrompt.toLowerCase().includes('4k')) {
    detailedPrompt = `${detailedPrompt}, 4k`;
  }
  if (!detailedPrompt.toLowerCase().includes('high detail')) {
    detailedPrompt = `${detailedPrompt}, high detail`;
  }
  if (!detailedPrompt.toLowerCase().includes('professional')) {
    detailedPrompt = `${detailedPrompt}, professional quality`;
  }
  
  return {
    prompt: detailedPrompt,
    creativeProcess: creativeProcess
  };
} 
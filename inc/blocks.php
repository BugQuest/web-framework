<?php

use BugQuest\Framework\PageBuilder\BlockRegistry;
use BugQuest\Framework\PageBuilder\Blocks\TextBlock;
use BugQuest\Framework\PageBuilder\Blocks\TitleBlock;
use BugQuest\Framework\PageBuilder\Blocks\MapBlock;

BlockRegistry::register(TitleBlock::class);
BlockRegistry::register(TextBlock::class);
BlockRegistry::register(MapBlock::class);




